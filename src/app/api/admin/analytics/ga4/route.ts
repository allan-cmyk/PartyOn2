import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import {
  getRevenueByChannel,
  getConversionByLandingPage,
  getCheckoutFunnel,
} from '@/lib/analytics/google-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/ga4?metric=revenue-by-channel|conversion-by-page|funnel&days=30
 * Thin agent-callable wrappers around GA4 Data API queries.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const metric = sp.get('metric') ?? 'revenue-by-channel';
  const days = Math.max(1, Math.min(365, parseInt(sp.get('days') ?? '30', 10)));
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    switch (metric) {
      case 'revenue-by-channel':
        return NextResponse.json({ metric, days, data: await getRevenueByChannel(startDate, endDate) });
      case 'conversion-by-page':
        return NextResponse.json({
          metric,
          days,
          data: await getConversionByLandingPage(startDate, endDate),
        });
      case 'funnel':
        return NextResponse.json({ metric, days, data: await getCheckoutFunnel(startDate, endDate) });
      default:
        return NextResponse.json({ error: `unknown metric: ${metric}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[admin/analytics/ga4]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 });
  }
}
