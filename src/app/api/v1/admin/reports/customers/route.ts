/**
 * Admin Customer Reports API
 * GET /api/v1/admin/reports/customers - Get customer analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { subDays, startOfDay, endOfDay, eachMonthOfInterval, format } from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get date range from query params
 */
function getDateRange(searchParams: URLSearchParams): DateRange {
  const range = searchParams.get('range') || '90d';
  const end = endOfDay(new Date());

  let start: Date;
  switch (range) {
    case '30d':
      start = startOfDay(subDays(new Date(), 30));
      break;
    case '90d':
      start = startOfDay(subDays(new Date(), 90));
      break;
    case '365d':
      start = startOfDay(subDays(new Date(), 365));
      break;
    case 'custom':
      const customStart = searchParams.get('start');
      const customEnd = searchParams.get('end');
      start = customStart ? startOfDay(new Date(customStart)) : startOfDay(subDays(new Date(), 90));
      if (customEnd) {
        return { start, end: endOfDay(new Date(customEnd)) };
      }
      break;
    default:
      start = startOfDay(subDays(new Date(), 90));
  }

  return { start, end };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { start, end } = getDateRange(searchParams);

    // Fetch customers with their orders
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate customer metrics
    const customerMetrics = customers.map((customer) => {
      const orderCount = customer.orders.length;
      const lifetimeValue = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);
      const firstOrder = customer.orders.length > 0
        ? customer.orders.reduce((min, o) => o.createdAt < min ? o.createdAt : min, customer.orders[0].createdAt)
        : null;
      const lastOrder = customer.orders.length > 0
        ? customer.orders.reduce((max, o) => o.createdAt > max ? o.createdAt : max, customer.orders[0].createdAt)
        : null;

      return {
        id: customer.id,
        email: customer.email,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
        orderCount,
        lifetimeValue,
        avgOrderValue: orderCount > 0 ? lifetimeValue / orderCount : 0,
        firstOrder,
        lastOrder,
        createdAt: customer.createdAt,
      };
    });

    // Summary metrics
    const totalCustomers = customers.length;
    const customersWithOrders = customerMetrics.filter((c) => c.orderCount > 0).length;
    const repeatCustomers = customerMetrics.filter((c) => c.orderCount > 1).length;
    const repeatRate = customersWithOrders > 0
      ? (repeatCustomers / customersWithOrders) * 100
      : 0;

    const totalLifetimeValue = customerMetrics.reduce((sum, c) => sum + c.lifetimeValue, 0);
    const avgLifetimeValue = customersWithOrders > 0
      ? totalLifetimeValue / customersWithOrders
      : 0;

    // New customers in date range
    const newCustomersInRange = customers.filter(
      (c) => c.createdAt >= start && c.createdAt <= end
    ).length;

    // Top customers by lifetime value
    const topCustomers = [...customerMetrics]
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        orderCount: c.orderCount,
        lifetimeValue: Math.round(c.lifetimeValue * 100) / 100,
        avgOrderValue: Math.round(c.avgOrderValue * 100) / 100,
      }));

    // Customer acquisition over time (by month)
    const months = eachMonthOfInterval({ start, end });
    const acquisitionChart = months.map((monthStart) => {
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const newInMonth = customers.filter(
        (c) => c.createdAt >= monthStart && c.createdAt <= monthEnd
      ).length;

      return {
        month: format(monthStart, 'MMM yyyy'),
        newCustomers: newInMonth,
      };
    });

    // Customer segments by order count
    const segments = {
      noOrders: customerMetrics.filter((c) => c.orderCount === 0).length,
      oneOrder: customerMetrics.filter((c) => c.orderCount === 1).length,
      twoToFiveOrders: customerMetrics.filter((c) => c.orderCount >= 2 && c.orderCount <= 5).length,
      sixPlusOrders: customerMetrics.filter((c) => c.orderCount >= 6).length,
    };

    // Customer segments by value
    const valueSegments = {
      under100: customerMetrics.filter((c) => c.lifetimeValue < 100).length,
      from100to500: customerMetrics.filter((c) => c.lifetimeValue >= 100 && c.lifetimeValue < 500).length,
      from500to1000: customerMetrics.filter((c) => c.lifetimeValue >= 500 && c.lifetimeValue < 1000).length,
      over1000: customerMetrics.filter((c) => c.lifetimeValue >= 1000).length,
    };

    const report = {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalCustomers,
        customersWithOrders,
        repeatCustomers,
        repeatRate: Math.round(repeatRate * 10) / 10,
        newCustomersInRange,
        avgLifetimeValue: Math.round(avgLifetimeValue * 100) / 100,
        totalLifetimeValue: Math.round(totalLifetimeValue * 100) / 100,
      },
      topCustomers,
      acquisitionChart,
      segments,
      valueSegments,
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('[Customer Reports API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer report' },
      { status: 500 }
    );
  }
}
