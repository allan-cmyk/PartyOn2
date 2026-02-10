/**
 * Admin Group Orders API
 * GET /api/v1/admin/group-orders - List all group orders with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { GroupOrderStatus, Prisma } from '@prisma/client';

interface GroupOrderListParams {
  search?: string;
  status?: GroupOrderStatus;
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params: GroupOrderListParams = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as GroupOrderStatus) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    };

    // Build where clause
    const where: Prisma.GroupOrderWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { shareCode: { contains: params.search, mode: 'insensitive' } },
        { hostName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) where.status = params.status;

    // Get total count
    const total = await prisma.groupOrder.count({ where });

    // Get group orders
    const groupOrders = await prisma.groupOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: ((params.page || 1) - 1) * (params.limit || 20),
      take: params.limit || 20,
      include: {
        hostCustomer: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { participants: true, orders: true },
        },
        orders: {
          select: { total: true },
        },
      },
    });

    // Transform response
    const transformedGroupOrders = groupOrders.map((group) => {
      const totalValue = group.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );

      return {
        id: group.id,
        name: group.name,
        shareCode: group.shareCode,
        status: group.status,
        host: group.hostCustomer
          ? {
              name: [group.hostCustomer.firstName, group.hostCustomer.lastName]
                .filter(Boolean)
                .join(' ') || group.hostName,
              email: group.hostCustomer.email,
            }
          : { name: group.hostName },
        deliveryDate: group.deliveryDate.toISOString(),
        deliveryTime: group.deliveryTime,
        participantCount: group._count.participants,
        orderCount: group._count.orders,
        totalValue,
        minimumOrderAmount: Number(group.minimumOrderAmount),
        createdAt: group.createdAt.toISOString(),
        expiresAt: group.expiresAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        groupOrders: transformedGroupOrders,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total,
          pages: Math.ceil(total / (params.limit || 20)),
        },
        filters: {
          statuses: Object.values(GroupOrderStatus),
        },
      },
    });
  } catch (error) {
    console.error('[Admin Group Orders API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group orders' },
      { status: 500 }
    );
  }
}
