/**
 * POST /api/admin/affiliates/payouts/generate
 * Manually trigger payout generation for a given month
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { generateMonthlyPayouts } from '@/lib/affiliates/payout-service';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAdminRole();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { year, month } = body;

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Valid year and month (1-12) are required' },
        { status: 400 }
      );
    }

    const payouts = await generateMonthlyPayouts(year, month);

    return NextResponse.json({
      success: true,
      data: {
        period: `${year}-${String(month).padStart(2, '0')}`,
        payoutsCreated: payouts.length,
        payouts: payouts.map((p) => ({
          id: p.id,
          affiliateId: p.affiliateId,
          totalAmountCents: p.totalAmountCents,
        })),
      },
    });
  } catch (error) {
    console.error('[Ops Payout Generate API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate payouts' }, { status: 500 });
  }
}
