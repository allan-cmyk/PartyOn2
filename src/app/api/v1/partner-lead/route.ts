/**
 * POST /api/v1/partner-lead
 *
 * Public-facing endpoint for the `/partners/<slug>/welcome` landing page form
 * (and any future partner-driven CTA that lives on our domain).
 *
 * No API-key auth — this is browser-facing. We use:
 *   - the `ref_code` cookie set by middleware (from /partners/<slug> visit
 *     or ?ref= query param) to look up the Affiliate
 *   - a 10 req/min/IP rate limit to thwart abuse
 *   - Zod validation on the body
 *
 * Customers who submit the form HAVE opted in by definition (the form is
 * the opt-in), so we go straight to the partner-lead service.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { normalizePartnerPayload } from '@/lib/partner-leads/normalizers';
import { persistPartnerLead } from '@/lib/partner-leads/service';

export const maxDuration = 15;

const inputSchema = z.object({
  email: z.string().email().optional().nullable(),
  phone: z
    .string()
    .min(7, 'Phone must be at least 7 digits')
    .max(20, 'Phone is too long')
    .optional()
    .nullable(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  /** Was this lead reached via a confirmation-email CTA? Drives GHL routing. */
  cameFromConfirmationEmail: z.boolean().optional(),
  sourcePage: z.string().max(500).optional().nullable(),
  utm: z
    .object({
      source: z.string().max(200).optional().nullable(),
      medium: z.string().max(200).optional().nullable(),
      campaign: z.string().max(200).optional().nullable(),
      content: z.string().max(200).optional().nullable(),
      term: z.string().max(200).optional().nullable(),
    })
    .optional(),
});

// ── In-memory rate limiter (per-IP, 10 req/min) ──────────────────────────
// Vercel serverless functions don't share memory across invocations, so this
// is best-effort: blocks repeated submissions from the same warm instance.
// Sufficient for casual abuse; for serious abuse we'd front this with
// Upstash/Redis. The signal also reaches our logs, where bursty IPs can be
// detected and blocked at the edge.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip) ?? [];
  const recent = bucket.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimitBuckets.set(ip, recent);
  return false;
}

/**
 * Resolve the Affiliate from the ref_code cookie. The cookie value may be
 * either an Affiliate.code (from ?ref=) or a partnerSlug (from
 * /partners/<slug>). Both are matched case-insensitively.
 */
async function resolveAffiliateFromCookie(refCookie: string | undefined) {
  if (!refCookie) return null;
  const normalized = refCookie.trim();
  if (!normalized) return null;
  // partnerSlug is stored lowercase in DB; code is uppercase
  return prisma.affiliate.findFirst({
    where: {
      OR: [
        { code: normalized.toUpperCase() },
        { partnerSlug: normalized.toLowerCase() },
      ],
      status: 'ACTIVE',
    },
    select: {
      id: true,
      code: true,
      partnerSlug: true,
      businessName: true,
      customerPerk: true,
    },
  });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // ── Resolve affiliate from ref_code cookie ───────────────────────
  const refCookie = request.cookies.get('ref_code')?.value;
  const affiliate = await resolveAffiliateFromCookie(refCookie);
  if (!affiliate) {
    return NextResponse.json(
      {
        error:
          'No partner attribution. Visit /partners/<slug> or include ?ref=<code> in your URL first.',
      },
      { status: 400 }
    );
  }

  // ── Parse + validate body ────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      { status: 400 }
    );
  }

  // ── Normalize ───────────────────────────────────────────────────
  const normResult = normalizePartnerPayload('landing_page', parsed.data);
  if (!normResult.ok) {
    return NextResponse.json(
      { error: 'Lead invalid', reason: normResult.reason },
      { status: 400 }
    );
  }

  // ── Persist + notify ────────────────────────────────────────────
  try {
    const result = await persistPartnerLead({
      lead: normResult.lead,
      affiliate,
    });
    return NextResponse.json({
      status: 'success',
      lead_id: result.lead.id,
      created: result.created,
      // Returning a tiny ack for the client so the page can show a confirmation
      perk: affiliate.customerPerk,
      partner_name: affiliate.businessName,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Partner Lead Public] Persistence error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}
