import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { getWebVitals, getVercelTopPages } from '@/lib/analytics/vercel-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/vercel?metric=web-vitals|top-pages&days=7
 * Returns null data when VERCEL_ANALYTICS_TOKEN is not set (not a failure).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const metric = sp.get('metric') ?? 'web-vitals';
  const days = Math.max(1, Math.min(90, parseInt(sp.get('days') ?? '7', 10)));
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    switch (metric) {
      case 'web-vitals':
        return NextResponse.json({ metric, days, data: await getWebVitals(startDate, endDate) });
      case 'top-pages':
        return NextResponse.json({ metric, days, data: await getVercelTopPages(startDate, endDate) });
      default:
        return NextResponse.json({ error: `unknown metric: ${metric}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[admin/analytics/vercel]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 });
  }
}
