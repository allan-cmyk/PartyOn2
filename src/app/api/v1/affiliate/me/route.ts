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

    // Monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentCommissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateId: affiliate.id,
        createdAt: { gte: sixMonthsAgo },
        status: { not: CommissionStatus.VOID },
      },
      select: {
        commissionBaseCents: true,
        commissionAmountCents: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthMap = new Map<string, { revenueCents: number; commissionCents: number; orderCount: number }>();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { revenueCents: 0, commissionCents: 0, orderCount: 0 });
    }

    for (const c of recentCommissions) {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key);
      if (entry) {
        entry.revenueCents += c.commissionBaseCents;
        entry.commissionCents += c.commissionAmountCents;
        entry.orderCount += 1;
      }
    }

    const monthlyStats = Array.from(monthMap.entries()).map(([month, stats]) => {
      const [y, m] = month.split('-');
      const date = new Date(Number(y), Number(m) - 1);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return { month, label, ...stats };
    });

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
        monthlyStats,
      },
    });
  } catch (error) {
    console.error('[Affiliate Me API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get profile' }, { status: 500 });
  }
}
