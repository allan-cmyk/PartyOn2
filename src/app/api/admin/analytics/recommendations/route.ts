import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import {
  listRecommendations,
  persistRecommendations,
  updateRecommendationStatus,
  type RecommendationStatus,
  type RecommendationDomain,
} from '@/lib/analytics/recommendation-store';
import { mirrorRecommendation } from '@/lib/analytics/recommendation-mirror';

export const dynamic = 'force-dynamic';

const STATUSES: RecommendationStatus[] = ['open', 'approved', 'shipped', 'rejected', 'invalidated'];
const DOMAINS: RecommendationDomain[] = ['marketing', 'seo'];

/**
 * GET  /api/admin/analytics/recommendations?status=open&segment=wedding&domain=marketing&limit=50
 * POST /api/admin/analytics/recommendations  body: { id, status, notes? }
 *                                          | body: { title, domain?, ..., source? }
 *
 * Lists Director-generated and heuristic recommendations from the persistent queue,
 * and lets ops move them through the open → approved → shipped (or rejected) workflow.
 *
 * `domain` defaults to `marketing` on POST when omitted (back-compat with Marketing
 * Director callers that predate the discriminator). SEO Director must pass `domain: "seo"`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const statusParam = sp.get('status');
  const segment = sp.get('segment') ?? undefined;
  const domainParam = sp.get('domain');
  const limit = Math.min(500, Math.max(1, parseInt(sp.get('limit') ?? '100', 10)));

  let status: RecommendationStatus | RecommendationStatus[] | undefined;
  if (statusParam) {
    const requested = statusParam.split(',').map((s) => s.trim()) as RecommendationStatus[];
    const valid = requested.filter((s): s is RecommendationStatus => STATUSES.includes(s));
    status = valid.length === 1 ? valid[0] : valid;
  }

  let domain: RecommendationDomain | RecommendationDomain[] | undefined;
  if (domainParam) {
    const requested = domainParam.split(',').map((s) => s.trim()) as RecommendationDomain[];
    const valid = requested.filter((d): d is RecommendationDomain => DOMAINS.includes(d));
    domain = valid.length === 1 ? valid[0] : valid.length > 1 ? valid : undefined;
  }

  const data = await listRecommendations({ status, segment, domain, limit });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);

  // Update path: { id, status, notes? }
  if (typeof body?.id === 'string') {
    const status = typeof body.status === 'string' ? body.status : null;
    const notes = typeof body.notes === 'string' ? body.notes : undefined;
    if (!status || !STATUSES.includes(status as RecommendationStatus)) {
      return NextResponse.json(
        { error: 'when id is given, status (open|approved|shipped|rejected|invalidated) is required' },
        { status: 400 }
      );
    }
    const { updated, priorStatus } = await updateRecommendationStatus(
      body.id,
      status as RecommendationStatus,
      notes
    );

    // Mirror to GitHub (fail-soft). Only mirror on actual transitions to avoid noise.
    let mirror: { mirrored: boolean; error?: string } | undefined;
    if (priorStatus !== status) {
      mirror = await mirrorRecommendation(updated, {
        date: new Date().toISOString().slice(0, 10),
        fromStatus: priorStatus,
        toStatus: status,
        notes,
        actor: 'operator',
      });
    }

    return NextResponse.json({ data: updated, mirror });
  }

  // Create path: { title, body?, domain?, segment?, impactDollarsMonthly?, effortTier?, riskTier?, source? }
  if (typeof body?.title === 'string') {
    const domain: RecommendationDomain | undefined = DOMAINS.includes(body.domain)
      ? body.domain
      : undefined;
    const validSources = ['director', 'manual', 'seo-director'] as const;
    const source = validSources.includes(body.source) ? body.source : 'manual';

    const result = await persistRecommendations(
      [{
        title: body.title,
        body: typeof body.body === 'string' ? body.body : undefined,
        domain,
        segment: typeof body.segment === 'string' ? body.segment : undefined,
        metric: typeof body.metric === 'string' ? body.metric : undefined,
        impactDollarsMonthly:
          typeof body.impactDollarsMonthly === 'number' ? body.impactDollarsMonthly : undefined,
        effortTier: ['s', 'm', 'l'].includes(body.effortTier) ? body.effortTier : undefined,
        riskTier: ['autonomous', 'recommend', 'hard_stop'].includes(body.riskTier)
          ? body.riskTier
          : undefined,
      }],
      source
    );
    return NextResponse.json({ data: result });
  }

  return NextResponse.json(
    { error: 'POST body must include either { id, status } to update or { title, ... } to create' },
    { status: 400 }
  );
}
