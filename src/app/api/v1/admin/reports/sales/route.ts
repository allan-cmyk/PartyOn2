/**
 * Admin Sales Reports API
 * Note: Order model not in Prisma schema - using Shopify for data
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Reports API not implemented - using Shopify Admin API for data',
    data: {
      dateRange: { start: null, end: null },
      summary: {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalTax: 0,
        totalDeliveryFees: 0,
        totalDiscounts: 0,
      },
      chartData: [],
      revenueByCategory: [],
      ordersByStatus: [],
    },
  }, { status: 501 });
}
