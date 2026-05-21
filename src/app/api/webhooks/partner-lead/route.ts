/**
 * POST /api/webhooks/partner-lead
 *
 * Inbound webhook endpoint for partner platforms (FareHarbor, future:
 * Hostfully/Guesty/OwnerRez for Airbnbs, Tock for restaurants, etc.).
 *
 * Auth: X-API-Key header (or `apikey` for Zapier-default compatibility)
 *       matched against Affiliate.webhookApiKey — same pattern as
 *       /api/webhooks/create-dashboard.
 *
 * Routing: ?source=<platform> in the query string selects the normalizer.
 *          Defaults to 'fareharbor' since that's our primary partner
 *          platform; future partners explicitly pass their own source.
 *
 * Behavior:
 *   - Authenticate against affiliate.webhookApiKey
 *   - Run payload through the source-specific normalizer
 *   - If normalizer returns ok=false, return 200 anyway with a `skipped:true`
 *     body (FareHarbor sends webhooks for EVERY booking; we don't want them
 *     to retry on "customer didn't opt in" — that's expected behavior)
 *   - Otherwise persist the lead and push to GHL
 *
 * Always returns 200 unless auth fails (401) or the payload is unparseable
 * JSON (400). Partner platforms tend to retry on non-2xx, so we don't want
 * legitimate "no opt-in" or normalizer-validation responses to trigger
 * retry storms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePartnerPayload } from '@/lib/partner-leads/normalizers';
import { persistPartnerLead } from '@/lib/partner-leads/service';
import type { PartnerLeadSource } from '@/lib/partner-leads/types';

export const maxDuration = 30;

const SUPPORTED_SOURCES: PartnerLeadSource[] = ['fareharbor', 'manual'];

function isSupportedSource(value: string | null): value is PartnerLeadSource {
  return value !== null && (SUPPORTED_SOURCES as string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // ── Auth ──────────────────────────────────────────────────────────
  // Accept both header names for partner compatibility (Zapier defaults
  // to `apikey`; FareHarbor and most others use `X-API-Key`).
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('apikey');
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key header (X-API-Key or apikey)' },
      { status: 401 }
    );
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { webhookApiKey: apiKey },
    select: {
      id: true,
      code: true,
      partnerSlug: true,
      businessName: true,
      customerPerk: true,
      status: true,
    },
  });

  if (!affiliate || affiliate.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 });
  }

  // ── Source dispatch ────────────────────────────────────────────────
  const sourceParam = request.nextUrl.searchParams.get('source') ?? 'fareharbor';
  if (!isSupportedSource(sourceParam)) {
    return NextResponse.json(
      { error: `Unsupported source '${sourceParam}'. Supported: ${SUPPORTED_SOURCES.join(', ')}` },
      { status: 400 }
    );
  }
  const source = sourceParam;

  // ── Parse body ────────────────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── Normalize ─────────────────────────────────────────────────────
  const normResult = normalizePartnerPayload(source, raw);
  if (!normResult.ok) {
    // Expected "skipped" cases (customer didn't opt in, no contact info,
    // merchant setup incomplete). Return 200 so the partner platform
    // doesn't retry.
    const processingMs = Date.now() - startTime;
    console.log(
      `[Partner Lead Webhook] Skipped: ${normResult.reason}`,
      { affiliateId: affiliate.id, source, processingMs }
    );
    return NextResponse.json(
      { status: 'skipped', reason: normResult.reason, processingMs },
      { status: 200 }
    );
  }

  // ── Persist + notify ──────────────────────────────────────────────
  try {
    const result = await persistPartnerLead({
      lead: normResult.lead,
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        partnerSlug: affiliate.partnerSlug,
        businessName: affiliate.businessName,
        customerPerk: affiliate.customerPerk,
      },
    });

    const processingMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'success',
      lead_id: result.lead.id,
      created: result.created,
      ghl_pushed: result.ghlPushed,
      skip_reason: result.reason ?? null,
      processingMs,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Partner Lead Webhook] Persistence error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to persist lead', detail: errorMessage },
      { status: 500 }
    );
  }
}
