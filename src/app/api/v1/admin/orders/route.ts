/**
 * Admin Orders API
 * Note: Order model not in Prisma schema - using Shopify for orders
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Orders managed via Shopify - local model not implemented',
    data: {
      orders: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      filters: {
        statuses: [],
        financialStatuses: [],
        fulfillmentStatuses: [],
        deliveryTypes: [],
      },
      summary: {
        total: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
        pendingFulfillment: 0,
      },
    },
  }, { status: 501 });
}
