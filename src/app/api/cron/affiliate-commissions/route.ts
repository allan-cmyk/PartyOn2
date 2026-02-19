/**
 * Daily cron: Promote HELD commissions to APPROVED after hold period expires.
 * Schedule: 0 6 * * * (6 AM UTC daily)
 *
 * Only promotes commissions where:
 * - status = HELD (not HELD_REVIEW -- those need manual admin action)
 * - deliveredAt IS NOT NULL (order was actually delivered)
 * - holdUntil IS NOT NULL AND holdUntil <= now()
 * - linked order is not CANCELLED or REFUNDED
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { CommissionStatus } from '@prisma/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find eligible commissions
    const eligibleCommissions = await prisma.affiliateCommission.findMany({
      where: {
        status: CommissionStatus.HELD,
        deliveredAt: { not: null },
        holdUntil: { not: null, lte: now },
      },
      include: {
        order: {
          select: { status: true },
        },
      },
    });

    let approved = 0;
    let voided = 0;

    for (const commission of eligibleCommissions) {
      const orderStatus = commission.order.status;

      if (orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED') {
        // Order was cancelled/refunded -- void the commission
        await prisma.affiliateCommission.update({
          where: { id: commission.id },
          data: {
            status: CommissionStatus.VOID,
            voidedAt: now,
            voidedReason: `order_${orderStatus.toLowerCase()}`,
          },
        });
        voided++;
      } else {
        // Promote to APPROVED
        await prisma.affiliateCommission.update({
          where: { id: commission.id },
          data: {
            status: CommissionStatus.APPROVED,
          },
        });
        approved++;
      }
    }

    console.log(`[Affiliate Cron] Processed ${eligibleCommissions.length} commissions: ${approved} approved, ${voided} voided`);

    return NextResponse.json({
      success: true,
      data: { processed: eligibleCommissions.length, approved, voided },
    });
  } catch (error) {
    console.error('[Affiliate Cron] Error:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}
