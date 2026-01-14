/**
 * Admin Customer Reports API
 * Note: Customer model not in Prisma schema - using Shopify for data
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Reports API not implemented - using Shopify Admin API for data',
    data: {
      dateRange: { start: null, end: null },
      summary: {
        totalCustomers: 0,
        customersWithOrders: 0,
        repeatCustomers: 0,
        repeatRate: 0,
        newCustomersInRange: 0,
        avgLifetimeValue: 0,
        totalLifetimeValue: 0,
      },
      topCustomers: [],
      acquisitionChart: [],
      segments: {},
      valueSegments: {},
    },
  }, { status: 501 });
}
