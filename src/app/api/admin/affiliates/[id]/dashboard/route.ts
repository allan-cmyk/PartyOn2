/**
 * GET /api/admin/affiliates/[id]/dashboard
 * Returns the same data an affiliate sees on their dashboard, for admin viewing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { CommissionStatus } from '@prisma/client';
import { getTierLabel, getTierProgress } from '@/lib/affiliates/commission-engine';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    if (!affiliate) {
      return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
    }

    // Year-to-date stats
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [yearCommissions, lifetimeAgg, commissions, payouts, dashboardOrders] = await Promise.all([
      // YTD commissions
      prisma.affiliateCommission.findMany({
        where: {
          affiliateId: id,
          createdAt: { gte: startOfYear },
          status: { not: CommissionStatus.VOID },
        },
      }),
      // Lifetime aggregate
      prisma.affiliateCommission.aggregate({
        where: {
          affiliateId: id,
          status: { not: CommissionStatus.VOID },
        },
        _sum: { commissionBaseCents: true, commissionAmountCents: true },
        _count: true,
      }),
      // Recent orders (commissions)
      prisma.affiliateCommission.findMany({
        where: { affiliateId: id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              subtotal: true,
              customerName: true,
              deliveryDate: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Payouts
      prisma.affiliatePayout.findMany({
        where: { affiliateId: id },
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
      }),
      // Dashboard orders (GroupOrderV2 created by this affiliate)
      prisma.groupOrderV2.findMany({
        where: { affiliateId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          tabs: {
            include: {
              draftItems: true,
              purchasedItems: true,
            },
          },
        },
      }),
    ]);

    const yearRevenueCents = yearCommissions.reduce((sum, c) => sum + c.commissionBaseCents, 0);
    const yearCommissionCents = yearCommissions.reduce((sum, c) => sum + c.commissionAmountCents, 0);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

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
        yearToDate: {
          revenueCents: yearRevenueCents,
          commissionCents: yearCommissionCents,
          orderCount: yearCommissions.length,
          currentTier: getTierLabel(yearRevenueCents),
          tierProgressPercent: Math.round(getTierProgress(yearRevenueCents)),
        },
        lifetime: {
          revenueCents: lifetimeAgg._sum.commissionBaseCents || 0,
          commissionCents: lifetimeAgg._sum.commissionAmountCents || 0,
          orderCount: lifetimeAgg._count,
        },
        orders: commissions.map((c) => ({
          orderId: c.orderId,
          orderNumber: c.order.orderNumber,
          customerName: c.order.customerName,
          orderDate: c.order.createdAt,
          deliveryDate: c.order.deliveryDate,
          subtotalCents: Math.round(Number(c.order.subtotal) * 100),
          commissionCents: c.commissionAmountCents,
          commissionRate: Number(c.commissionRate),
          tier: c.tierAtTime,
          status: c.status,
        })),
        payouts,
        dashboardOrders: dashboardOrders.map((order) => {
          const totalDraftItems = order.tabs.reduce((sum, tab) => sum + tab.draftItems.length, 0);
          const totalPurchasedItems = order.tabs.reduce((sum, tab) => sum + tab.purchasedItems.length, 0);
          const totalRevenue = order.tabs.reduce(
            (sum, tab) => sum + tab.purchasedItems.reduce((s, item) => s + Number(item.price) * item.quantity, 0),
            0
          );
          const firstTab = order.tabs.sort((a, b) => a.position - b.position)[0];

          return {
            id: order.id,
            name: order.name,
            shareCode: order.shareCode,
            status: order.status,
            hostName: order.hostName,
            partyType: order.partyType,
            draftItemCount: totalDraftItems,
            purchasedItemCount: totalPurchasedItems,
            totalRevenue,
            viewCount: order.viewCount,
            tabCount: order.tabs.length,
            deliveryDate: firstTab?.deliveryDate?.toISOString() || null,
            dashboardUrl: `${appUrl}/dashboard/${order.shareCode}`,
            createdAt: order.createdAt.toISOString(),
          };
        }),
      },
    });
  } catch (error) {
    console.error('[Admin Affiliate Dashboard API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load dashboard' }, { status: 500 });
  }
}
