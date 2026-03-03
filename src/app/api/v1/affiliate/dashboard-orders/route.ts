/**
 * GET /api/v1/affiliate/dashboard-orders
 * Returns all GroupOrderV2 records created by the authenticated partner.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const orders = await prisma.groupOrderV2.findMany({
      where: { affiliateId: session.affiliateId },
      orderBy: { createdAt: 'desc' },
      include: {
        tabs: {
          include: {
            draftItems: true,
            purchasedItems: true,
          },
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

    const data = orders.map((order) => {
      const totalDraftItems = order.tabs.reduce(
        (sum, tab) => sum + tab.draftItems.length,
        0
      );
      const totalPurchasedItems = order.tabs.reduce(
        (sum, tab) => sum + tab.purchasedItems.length,
        0
      );
      const totalRevenue = order.tabs.reduce(
        (sum, tab) =>
          sum +
          tab.purchasedItems.reduce(
            (s, item) => s + Number(item.price) * item.quantity,
            0
          ),
        0
      );

      // First tab's delivery date (for display)
      const firstTab = order.tabs.sort((a, b) => a.position - b.position)[0];
      const deliveryDate = firstTab?.deliveryDate?.toISOString() || null;

      return {
        id: order.id,
        name: order.name,
        shareCode: order.shareCode,
        status: order.status,
        hostName: order.hostName,
        hostEmail: order.hostEmail,
        hostPhone: order.hostPhone,
        partyType: order.partyType,
        source: order.source,
        draftItemCount: totalDraftItems,
        purchasedItemCount: totalPurchasedItems,
        totalRevenue,
        viewCount: order.viewCount,
        tabCount: order.tabs.length,
        deliveryDate,
        dashboardUrl: `${appUrl}/dashboard/${order.shareCode}`,
        createdAt: order.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Partner Dashboard Orders] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
