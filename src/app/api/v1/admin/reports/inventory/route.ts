/**
 * Admin Inventory Reports API
 * Note: Inventory model not in Prisma schema - using Shopify for data
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Reports API not implemented - using Shopify Admin API for data',
    data: {
      dateRange: { start: null, end: null },
      summary: {
        totalItems: 0,
        totalUnits: 0,
        totalValue: 0,
        lowStockCount: 0,
        needsReorderCount: 0,
        outOfStockCount: 0,
      },
      inventoryByCategory: [],
      lowStockItems: [],
      reorderItems: [],
      topSelling: [],
      slowMoving: [],
    },
  }, { status: 501 });
}
