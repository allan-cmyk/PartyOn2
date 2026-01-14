/**
 * Admin Dashboard API
 * GET /api/v1/admin/dashboard - Get dashboard stats and data
 *
 * Note: Required models (Product, Order, Customer, InventoryItem) not in Prisma schema
 * Using Shopify Admin API directly for product/order/customer data
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Dashboard API not implemented - using Shopify Admin API for data',
    data: {
      stats: {
        totalProducts: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        pendingOrders: 0,
        todayOrders: 0,
        totalCustomers: 0,
      },
      recentOrders: [],
      lowStockItems: [],
    },
  }, { status: 501 });
}
