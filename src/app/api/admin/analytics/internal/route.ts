import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import {
  getChannelRollup,
  getLandingPageRollup,
  getProductMargins,
  getSegmentRollup,
  getAffiliateRoi,
} from '@/lib/analytics/internal-rollups';
import { getRepeatRateBySegment, getLtvBySegment } from '@/lib/analytics/cohort-rollups';
import { prisma } from '@/lib/database/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/internal?metric=channels|landing-pages|product-margins|segments|repeat-rate|ltv|affiliate-roi|snapshot-latest&days=30
 * Exposes internal DB rollups the Marketing Director agent reads (orders, margins, attribution).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const metric = sp.get('metric') ?? 'channels';
  const days = Math.max(1, Math.min(365, parseInt(sp.get('days') ?? '30', 10)));

  try {
    switch (metric) {
      case 'channels':
        return NextResponse.json({ metric, days, data: await getChannelRollup(days) });
      case 'landing-pages':
        return NextResponse.json({ metric, days, data: await getLandingPageRollup(days) });
      case 'product-margins':
        return NextResponse.json({ metric, days, data: await getProductMargins(days) });
      case 'segments':
        return NextResponse.json({ metric, days, data: await getSegmentRollup(days) });
      case 'repeat-rate':
        return NextResponse.json({ metric, days, data: await getRepeatRateBySegment(days) });
      case 'ltv': {
        const monthsBack = Math.max(1, Math.min(36, parseInt(sp.get('monthsBack') ?? '12', 10)));
        return NextResponse.json({ metric, monthsBack, data: await getLtvBySegment(monthsBack) });
      }
      case 'affiliate-roi':
        return NextResponse.json({ metric, days, data: await getAffiliateRoi(days) });
      case 'snapshot-latest': {
        const snap = await prisma.analyticsSnapshot.findFirst({ orderBy: { date: 'desc' } });
        return NextResponse.json({ metric, data: snap });
      }
      default:
        return NextResponse.json({ error: `unknown metric: ${metric}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[admin/analytics/internal]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 });
  }
}
