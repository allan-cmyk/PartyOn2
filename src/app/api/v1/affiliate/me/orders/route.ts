/**
 * GET /api/v1/affiliate/me/orders
 * Paginated attributed orders with commission info
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const [commissions, total] = await Promise.all([
      prisma.affiliateCommission.findMany({
        where: { affiliateId: session.affiliateId },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              subtotal: true,
              total: true,
              customerName: true,
              deliveryDate: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliateCommission.count({
        where: { affiliateId: session.affiliateId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
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
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Affiliate Orders API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get orders' }, { status: 500 });
  }
}
