/**
 * Admin Sales Reports API
 * GET /api/v1/admin/reports/sales - Get detailed sales analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

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
    const groupBy = searchParams.get('groupBy') || 'day';

    // Fetch all orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        subtotal: true,
        taxAmount: true,
        deliveryFee: true,
        discountAmount: true,
        createdAt: true,
        status: true,
        items: {
          select: {
            productId: true,
            quantity: true,
            totalPrice: true,
            product: {
              select: {
                productType: true,
              },
            },
          },
        },
      },
    });

    // Generate date buckets based on groupBy
    let intervals: Date[];
    let formatStr: string;
    switch (groupBy) {
      case 'week':
        intervals = eachWeekOfInterval({ start, end });
        formatStr = 'MMM d';
        break;
      case 'month':
        intervals = eachMonthOfInterval({ start, end });
        formatStr = 'MMM yyyy';
        break;
      default: // day
        intervals = eachDayOfInterval({ start, end });
        formatStr = 'MMM d';
    }

    // Group orders by date bucket
    const chartData = intervals.map((intervalStart) => {
      let intervalEnd: Date;
      if (groupBy === 'week') {
        intervalEnd = endOfDay(subDays(new Date(intervalStart.getTime() + 7 * 24 * 60 * 60 * 1000), 1));
      } else if (groupBy === 'month') {
        const nextMonth = new Date(intervalStart);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        intervalEnd = endOfDay(subDays(nextMonth, 1));
      } else {
        intervalEnd = endOfDay(intervalStart);
      }

      const periodOrders = orders.filter(
        (o) => o.createdAt >= intervalStart && o.createdAt <= intervalEnd
      );

      const revenue = periodOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const orderCount = periodOrders.length;

      return {
        date: format(intervalStart, formatStr),
        revenue: Math.round(revenue * 100) / 100,
        orders: orderCount,
        avgOrderValue: orderCount > 0 ? Math.round((revenue / orderCount) * 100) / 100 : 0,
      };
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalTax = orders.reduce((sum, o) => sum + Number(o.taxAmount), 0);
    const totalDeliveryFees = orders.reduce((sum, o) => sum + Number(o.deliveryFee), 0);
    const totalDiscounts = orders.reduce((sum, o) => sum + Number(o.discountAmount), 0);

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.productType || 'Other';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + Number(item.totalPrice);
      });
    });

    const revenueByCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category,
        revenue: Math.round(revenue * 100) / 100,
        percentage: Math.round((revenue / totalRevenue) * 1000) / 10,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Order count by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: start, lte: end } },
      _count: true,
    });

    const report = {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalDeliveryFees: Math.round(totalDeliveryFees * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100,
      },
      chartData,
      revenueByCategory,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('[Sales Reports API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales report' },
      { status: 500 }
    );
  }
}
