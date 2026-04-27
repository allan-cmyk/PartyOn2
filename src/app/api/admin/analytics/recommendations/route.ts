import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import {
  listRecommendations,
  persistRecommendations,
  updateRecommendationStatus,
  type RecommendationStatus,
} from '@/lib/analytics/recommendation-store';

export const dynamic = 'force-dynamic';

const STATUSES: RecommendationStatus[] = ['open', 'approved', 'shipped', 'rejected', 'invalidated'];

/**
 * GET  /api/admin/analytics/recommendations?status=open&segment=wedding&limit=50
 * POST /api/admin/analytics/recommendations  body: { id, status, notes? }
 *
 * Lists Director-generated and heuristic recommendations from the persistent queue,
 * and lets ops move them through the open → approved → shipped (or rejected) workflow.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const statusParam = sp.get('status');
  const segment = sp.get('segment') ?? undefined;
  const limit = Math.min(500, Math.max(1, parseInt(sp.get('limit') ?? '100', 10)));

  let status: RecommendationStatus | RecommendationStatus[] | undefined;
  if (statusParam) {
    const requested = statusParam.split(',').map((s) => s.trim()) as RecommendationStatus[];
    const valid = requested.filter((s): s is RecommendationStatus => STATUSES.includes(s));
    status = valid.length === 1 ? valid[0] : valid;
  }

  const data = await listRecommendations({ status, segment, limit });
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
    const updated = await updateRecommendationStatus(body.id, status as RecommendationStatus, notes);
    return NextResponse.json({ data: updated });
  }

  // Create path: { title, body?, segment?, impactDollarsMonthly?, effortTier?, riskTier?, source? }
  if (typeof body?.title === 'string') {
    const result = await persistRecommendations(
      [{
        title: body.title,
        body: typeof body.body === 'string' ? body.body : undefined,
        segment: typeof body.segment === 'string' ? body.segment : undefined,
        metric: typeof body.metric === 'string' ? body.metric : undefined,
        impactDollarsMonthly:
          typeof body.impactDollarsMonthly === 'number' ? body.impactDollarsMonthly : undefined,
        effortTier: ['s', 'm', 'l'].includes(body.effortTier) ? body.effortTier : undefined,
        riskTier: ['autonomous', 'recommend', 'hard_stop'].includes(body.riskTier)
          ? body.riskTier
          : undefined,
      }],
      body.source === 'director' || body.source === 'manual' ? body.source : 'manual'
    );
    return NextResponse.json({ data: result });
  }

  return NextResponse.json(
    { error: 'POST body must include either { id, status } to update or { title, ... } to create' },
    { status: 400 }
  );
}
