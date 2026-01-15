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

      // Low stock items (above 0 but at or below threshold)
      prisma.inventoryItem.count({
        where: {
          quantity: { gt: 0, lte: prisma.inventoryItem.fields.lowStockThreshold },
        },
      }).catch(() => 0), // This query might not work directly, handle in alternative way

      // Out of stock
      prisma.inventoryItem.count({ where: { quantity: 0 } }),

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
      prisma.$queryRaw<Array<{ id: string; name: string; quantity: number; threshold: number }>>`
        SELECT
          ii.id,
          p.title as name,
          ii.quantity,
          ii.low_stock_threshold as threshold
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.quantity <= ii.low_stock_threshold
        ORDER BY ii.quantity ASC
        LIMIT 5
      `.catch(() => []),
    ]);

    // Alternative low stock count using raw query
    const lowStockCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM inventory_items
      WHERE quantity > 0 AND quantity <= low_stock_threshold
    `.catch(() => [{ count: BigInt(0) }]);

    const actualLowStockItems = Number(lowStockCount[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          lowStockItems: actualLowStockItems || lowStockItems,
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
