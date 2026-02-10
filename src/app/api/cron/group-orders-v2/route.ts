/**
 * Cron: Auto-lock expired tabs
 * Run periodically to lock tabs whose orderDeadline has passed
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron or manual trigger)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Lock tabs whose deadline has passed and are still OPEN
    const result = await prisma.subOrder.updateMany({
      where: {
        status: 'OPEN',
        orderDeadline: { lt: now },
      },
      data: {
        status: 'LOCKED',
      },
    });

    // Close expired group orders (30 days old)
    const expiredGroups = await prisma.groupOrderV2.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: now },
      },
      data: {
        status: 'CLOSED',
      },
    });

    return NextResponse.json({
      success: true,
      tabsLocked: result.count,
      groupsClosed: expiredGroups.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Group Orders V2 error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
