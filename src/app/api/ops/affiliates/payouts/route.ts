/**
 * GET /api/ops/affiliates/payouts -- list payouts
 */

import { NextRequest, NextResponse } from 'next/server';
import { listPayouts } from '@/lib/affiliates/payout-service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const affiliateId = request.nextUrl.searchParams.get('affiliateId') || undefined;
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const payoutPeriod = request.nextUrl.searchParams.get('period') || undefined;

    const payouts = await listPayouts({
      affiliateId,
      status: status as 'PENDING' | 'COMPLETED' | 'FAILED' | undefined,
      payoutPeriod,
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (error) {
    console.error('[Ops Payouts API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list payouts' }, { status: 500 });
  }
}
