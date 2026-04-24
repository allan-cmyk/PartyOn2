import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { getGbpInsights, getSegmentSentiment } from '@/lib/analytics/gbp';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/gbp?metric=insights|segments&days=30
 * Reads from local GbpReview table (populated by nightly cron via syncGbpReviews).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const metric = sp.get('metric') ?? 'insights';
  const days = Math.max(1, Math.min(365, parseInt(sp.get('days') ?? '30', 10)));

  try {
    switch (metric) {
      case 'insights':
        return NextResponse.json({ metric, days, data: await getGbpInsights(days) });
      case 'segments':
        return NextResponse.json({ metric, days, data: await getSegmentSentiment(days) });
      default:
        return NextResponse.json({ error: `unknown metric: ${metric}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[admin/analytics/gbp]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 });
  }
}
