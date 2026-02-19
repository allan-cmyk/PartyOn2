/**
 * Monthly cron: Generate affiliate payouts.
 * Schedule: 0 14 1 * * (1st of month at 2 PM UTC / 8 AM CST)
 *
 * Generates payouts for the PREVIOUS month's approved commissions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMonthlyPayouts } from '@/lib/affiliates/payout-service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Generate payouts for previous month
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth(); // 1-12
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const payouts = await generateMonthlyPayouts(prevYear, prevMonth);

    return NextResponse.json({
      success: true,
      data: {
        period: `${prevYear}-${String(prevMonth).padStart(2, '0')}`,
        payoutsCreated: payouts.length,
      },
    });
  } catch (error) {
    console.error('[Affiliate Payout Cron] Error:', error);
    return NextResponse.json({ success: false, error: 'Payout generation failed' }, { status: 500 });
  }
}
