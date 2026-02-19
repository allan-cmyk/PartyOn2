/**
 * GET /api/v1/affiliate/me/payouts
 * Payout history for the authenticated affiliate
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payouts = await prisma.affiliatePayout.findMany({
      where: { affiliateId: session.affiliateId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        payoutPeriod: true,
        totalAmountCents: true,
        status: true,
        processedAt: true,
        createdAt: true,
        _count: { select: { commissions: true } },
      },
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (error) {
    console.error('[Affiliate Payouts API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get payouts' }, { status: 500 });
  }
}
