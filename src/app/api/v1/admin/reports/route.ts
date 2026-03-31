/**
 * Admin Reports API - Dashboard Summary
 * GET /api/v1/admin/reports - Get summary metrics across all categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get date range from query params
 */
function getDateRange(searchParams: URLSearchParams): DateRange {
  const range = searchParams.get('range') || '30d';
  const end = endOfDay(new Date());

  let start: Date;
  switch (range) {
    case '7d':
      start = startOfDay(subDays(new Date(), 7));
      break;
    case '30d':
      start = startOfDay(subDays(new Date(), 30));
      break;
    case '90d':
      start = startOfDay(subDays(new Date(), 90));
      break;
    case 'custom':
      const customStart = searchParams.get('start');
      const customEnd = searchParams.get('end');
      start = customStart ? startOfDay(new Date(customStart)) : startOfDay(subDays(new Date(), 30));
      if (customEnd) {
        return { start, end: endOfDay(new Date(customEnd)) };
      }
      break;
    default:
      start = startOfDay(subDays(new Date(), 30));
  }

  return { start, end };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { start, end } = getDateRange(searchParams);

    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = new Date(end.getTime() - periodLength);

    // Parallel fetch all metrics
    const [
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      inventoryStats,
      topProducts,
      recentOrders,
    ] = await Promise.all([
      // Current period orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
        _count: true,
        _sum: { total: true },
      }),
      // Previous period orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: prevStart, lte: prevEnd },
          status: { not: 'CANCELLED' },
        },
        _count: true,
        _sum: { total: true },
      }),
      // Current period new customers
      prisma.customer.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      // Previous period new customers
      prisma.customer.count({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
      }),
      // Inventory stats
      prisma.productVariant.aggregate({
        _sum: { inventoryQuantity: true },
        _count: true,
      }),
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: start, lte: end },
            status: { not: 'CANCELLED' },
          },
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
      // Recent orders
      prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Get product details for top products
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.title]));

    // Calculate metrics
    const currentRevenue = Number(currentOrders._sum.total || 0);
    const previousRevenue = Number(previousOrders._sum.total || 0);
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const currentOrderCount = currentOrders._count;
    const previousOrderCount = previousOrders._count;
    const orderCountChange = previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : 0;

    const avgOrderValue = currentOrderCount > 0
      ? currentRevenue / currentOrderCount
      : 0;
    const prevAvgOrderValue = previousOrderCount > 0
      ? previousRevenue / previousOrderCount
      : 0;
    const aovChange = prevAvgOrderValue > 0
      ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
      : 0;

    const customerChange = previousCustomers > 0
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

    // Count low stock items
    const lowStockItems = await prisma.productVariant.count({
      where: { inventoryQuantity: { gt: 0, lte: 10 }, trackInventory: true },
    });

    const summary = {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      sales: {
        revenue: currentRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        orders: currentOrderCount,
        ordersChange: Math.round(orderCountChange * 10) / 10,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        aovChange: Math.round(aovChange * 10) / 10,
      },
      customers: {
        newCustomers: currentCustomers,
        newCustomersChange: Math.round(customerChange * 10) / 10,
        totalCustomers: await prisma.customer.count(),
      },
      inventory: {
        totalItems: inventoryStats._count,
        totalUnits: Number(inventoryStats._sum.inventoryQuantity || 0),
        lowStockItems,
      },
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        productTitle: productMap.get(p.productId) || 'Unknown',
        unitsSold: p._sum.quantity || 0,
        revenue: Number(p._sum.totalPrice || 0),
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('[Reports API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report summary' },
      { status: 500 }
    );
  }
}
