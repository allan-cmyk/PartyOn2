/**
 * GET /api/v1/affiliate/me
 * Get current affiliate profile + stats
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';
import { CommissionStatus } from '@prisma/client';
import { getTierLabel, getTierProgress, getAnniversaryYearStart } from '@/lib/affiliates/commission-engine';

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

    // Year-to-date stats (rolling year from affiliate join date)
    const yearStart = getAnniversaryYearStart(affiliate.createdAt);

    const yearCommissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateId: affiliate.id,
        createdAt: { gte: yearStart },
        status: { not: CommissionStatus.VOID },
      },
    });

    const yearRevenueCents = yearCommissions.reduce((sum, c) => sum + c.commissionBaseCents, 0);
    const yearCommissionCents = yearCommissions.reduce((sum, c) => sum + c.commissionAmountCents, 0);

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
    const tierLabel = getTierLabel(yearRevenueCents);
    const tierProgressPercent = Math.round(getTierProgress(yearRevenueCents));

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          code: affiliate.code,
          businessName: affiliate.businessName,
          contactName: affiliate.contactName,
          email: affiliate.email,
          hasPassword: !!affiliate.passwordHash,
        },
        yearToDate: {
          revenueCents: yearRevenueCents,
          commissionCents: yearCommissionCents,
          orderCount: yearCommissions.length,
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
