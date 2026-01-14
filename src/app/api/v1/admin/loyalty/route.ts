/**
 * Admin Loyalty API
 * GET /api/v1/admin/loyalty - Get loyalty program overview
 * POST /api/v1/admin/loyalty/init - Initialize loyalty tiers
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { initializeLoyaltyTiers, getLoyaltyTiers } from '@/lib/loyalty/loyalty-service';

export async function GET(): Promise<NextResponse> {
  try {
    // Get tiers
    const tiers = await getLoyaltyTiers();

    // Get customer counts per tier
    const tierStats = await prisma.customerLoyalty.groupBy({
      by: ['tierId'],
      _count: { id: true },
      _sum: { points: true, lifetimeSpend: true },
    });

    const tierStatsMap = new Map(
      tierStats.map((t) => [t.tierId, {
        customerCount: t._count.id,
        totalPoints: t._sum.points || 0,
        totalLifetimeSpend: t._sum.lifetimeSpend || 0,
      }])
    );

    // Get total stats
    const totalCustomers = await prisma.customerLoyalty.count();
    const totals = await prisma.customerLoyalty.aggregate({
      _sum: { points: true, lifetimeSpend: true, lifetimePoints: true },
    });

    // Recent transactions
    const recentTransactions = await prisma.pointsTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        loyalty: {
          include: {
            customer: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        tiers: tiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          color: tier.color,
          minLifetimeSpend: Number(tier.minLifetimeSpend),
          pointsMultiplier: tier.pointsMultiplier,
          discountPercent: tier.discountPercent,
          freeDeliveryMin: tier.freeDeliveryMin ? Number(tier.freeDeliveryMin) : null,
          benefits: tier.benefits,
          stats: tierStatsMap.get(tier.id) || {
            customerCount: 0,
            totalPoints: 0,
            totalLifetimeSpend: 0,
          },
        })),
        summary: {
          totalCustomers,
          totalPointsOutstanding: totals._sum.points || 0,
          totalLifetimeSpend: Number(totals._sum.lifetimeSpend || 0),
          totalPointsEarned: totals._sum.lifetimePoints || 0,
        },
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          type: t.type,
          points: t.points,
          description: t.description,
          customerName: [t.loyalty.customer.firstName, t.loyalty.customer.lastName]
            .filter(Boolean).join(' ') || t.loyalty.customer.email,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('[Admin Loyalty API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'init') {
      await initializeLoyaltyTiers();
      return NextResponse.json({
        success: true,
        message: 'Loyalty tiers initialized',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Admin Loyalty API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
