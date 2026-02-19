/**
 * GET /api/v1/affiliate/me
 * Get current affiliate profile + stats
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';
import { CommissionStatus } from '@prisma/client';
import { getTierLabel, getTierProgress } from '@/lib/affiliates/commission-engine';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: session.affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
    }

    // Month-to-date stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthCommissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateId: affiliate.id,
        createdAt: { gte: startOfMonth },
        status: { not: CommissionStatus.VOID },
      },
    });

    const monthRevenueCents = monthCommissions.reduce((sum, c) => sum + c.commissionBaseCents, 0);
    const monthCommissionCents = monthCommissions.reduce((sum, c) => sum + c.commissionAmountCents, 0);

    // Lifetime stats
    const lifetimeCommissions = await prisma.affiliateCommission.aggregate({
      where: {
        affiliateId: affiliate.id,
        status: { not: CommissionStatus.VOID },
      },
      _sum: {
        commissionBaseCents: true,
        commissionAmountCents: true,
      },
      _count: true,
    });

    // Current tier using shared helpers
    const tierLabel = getTierLabel(monthRevenueCents);
    const tierProgressPercent = Math.round(getTierProgress(monthRevenueCents));

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          code: affiliate.code,
          businessName: affiliate.businessName,
          contactName: affiliate.contactName,
          email: affiliate.email,
        },
        monthToDate: {
          revenueCents: monthRevenueCents,
          commissionCents: monthCommissionCents,
          orderCount: monthCommissions.length,
          currentTier: tierLabel,
          tierProgressPercent,
        },
        lifetime: {
          revenueCents: lifetimeCommissions._sum.commissionBaseCents || 0,
          commissionCents: lifetimeCommissions._sum.commissionAmountCents || 0,
          orderCount: lifetimeCommissions._count,
        },
      },
    });
  } catch (error) {
    console.error('[Affiliate Me API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get profile' }, { status: 500 });
  }
}
