/**
 * Admin Dashboard API
 * GET /api/v1/admin/dashboard - Get dashboard stats and data
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(): Promise<NextResponse> {
  try {
    // Get stats in parallel
    const [
      totalProducts,
      lowStockItems,
      outOfStockItems,
      pendingOrders,
      todayOrders,
      totalCustomers,
      recentOrders,
      lowStockAlerts,
    ] = await Promise.all([
      // Total products
      prisma.product.count({ where: { status: 'ACTIVE' } }),

      // Low stock items (above 0 but at or below 10)
      prisma.productVariant.count({
        where: { inventoryQuantity: { gt: 0, lte: 10 }, trackInventory: true },
      }),

      // Out of stock
      prisma.productVariant.count({
        where: { inventoryQuantity: { lte: 0 }, trackInventory: true },
      }),

      // Pending orders
      prisma.order.count({ where: { status: 'PENDING' } }),

      // Today's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // Total customers
      prisma.customer.count(),

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),

      // Low stock items for alerts
      prisma.productVariant.findMany({
        where: { inventoryQuantity: { gt: 0, lte: 10 }, trackInventory: true },
        orderBy: { inventoryQuantity: 'asc' },
        take: 5,
        select: {
          id: true,
          inventoryQuantity: true,
          product: { select: { title: true } },
        },
      }).then(items => items.map(i => ({
        id: i.id,
        name: i.product.title,
        quantity: i.inventoryQuantity,
        threshold: 10,
      }))).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          lowStockItems,
          outOfStockItems,
          pendingOrders,
          todayOrders,
          totalCustomers,
        },
        recentOrders: recentOrders.map((order) => ({
          ...order,
          total: Number(order.total),
        })),
        lowStockItems: lowStockAlerts,
      },
    });
  } catch (error) {
    console.error('[Admin Dashboard] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      },
      { status: 500 }
    );
  }
}
