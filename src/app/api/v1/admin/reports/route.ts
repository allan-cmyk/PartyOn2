/**
 * Admin Reports Dashboard API
 * Note: Required models not in Prisma schema - using Shopify for data
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Reports API not implemented - using Shopify Admin API for data',
    data: {
      dateRange: { start: null, end: null },
      sales: {
        revenue: 0,
        revenueChange: 0,
        orders: 0,
        ordersChange: 0,
        avgOrderValue: 0,
        aovChange: 0,
      },
      customers: {
        newCustomers: 0,
        newCustomersChange: 0,
        totalCustomers: 0,
      },
      inventory: {
        totalItems: 0,
        totalUnits: 0,
        lowStockItems: 0,
      },
      topProducts: [],
      recentOrders: [],
    },
  }, { status: 501 });
}
