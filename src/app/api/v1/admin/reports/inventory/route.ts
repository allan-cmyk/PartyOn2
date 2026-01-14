/**
 * Admin Inventory Reports API
 * GET /api/v1/admin/reports/inventory - Get inventory health analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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
    default:
      start = startOfDay(subDays(new Date(), 30));
  }

  return { start, end };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { start, end } = getDateRange(searchParams);

    // Fetch inventory items with product details
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productType: true,
            basePrice: true,
          },
        },
        variant: {
          select: {
            id: true,
            title: true,
            sku: true,
          },
        },
      },
    });

    // Fetch sales data for turnover calculation
    const salesData = await prisma.orderItem.groupBy({
      by: ['productId', 'variantId'],
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
      },
      _sum: { quantity: true },
    });

    const salesMap = new Map(
      salesData.map((s) => [`${s.productId}-${s.variantId}`, s._sum.quantity || 0])
    );

    // Calculate metrics for each item
    const itemMetrics = inventoryItems.map((item) => {
      const soldQuantity = salesMap.get(`${item.productId}-${item.variantId}`) || 0;
      const daysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const dailySales = daysInRange > 0 ? soldQuantity / daysInRange : 0;
      const daysOfStock = dailySales > 0 ? Math.round(item.quantity / dailySales) : null;
      const turnoverRate = item.quantity > 0 ? (soldQuantity / item.quantity) * 100 : 0;
      const inventoryValue = Number(item.costPerUnit || item.product.basePrice) * item.quantity;
      const isLowStock = item.quantity <= item.lowStockThreshold;
      const needsReorder = item.quantity <= item.reorderPoint;

      return {
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        productType: item.product.productType,
        variantTitle: item.variant?.title,
        sku: item.variant?.sku,
        quantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold,
        reorderPoint: item.reorderPoint,
        soldQuantity,
        dailySales: Math.round(dailySales * 100) / 100,
        daysOfStock,
        turnoverRate: Math.round(turnoverRate * 10) / 10,
        inventoryValue: Math.round(inventoryValue * 100) / 100,
        isLowStock,
        needsReorder,
      };
    });

    // Summary metrics
    const totalItems = inventoryItems.length;
    const totalUnits = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = itemMetrics.reduce((sum, i) => sum + i.inventoryValue, 0);
    const lowStockCount = itemMetrics.filter((i) => i.isLowStock).length;
    const needsReorderCount = itemMetrics.filter((i) => i.needsReorder).length;
    const outOfStockCount = itemMetrics.filter((i) => i.quantity === 0).length;

    // Inventory by category
    const categoryStats: Record<string, { units: number; value: number; items: number }> = {};
    itemMetrics.forEach((item) => {
      const category = item.productType || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = { units: 0, value: 0, items: 0 };
      }
      categoryStats[category].units += item.quantity;
      categoryStats[category].value += item.inventoryValue;
      categoryStats[category].items += 1;
    });

    const inventoryByCategory = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        units: stats.units,
        value: Math.round(stats.value * 100) / 100,
        items: stats.items,
      }))
      .sort((a, b) => b.value - a.value);

    // Low stock items
    const lowStockItems = itemMetrics
      .filter((i) => i.isLowStock)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10);

    // Items needing reorder
    const reorderItems = itemMetrics
      .filter((i) => i.needsReorder)
      .sort((a, b) => (a.daysOfStock || 0) - (b.daysOfStock || 0))
      .slice(0, 10);

    // Top selling items (by turnover)
    const topSelling = [...itemMetrics]
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, 10)
      .map((i) => ({
        productTitle: i.productTitle,
        variantTitle: i.variantTitle,
        soldQuantity: i.soldQuantity,
        currentStock: i.quantity,
        daysOfStock: i.daysOfStock,
      }));

    // Slow moving items (low turnover with high stock)
    const slowMoving = itemMetrics
      .filter((i) => i.quantity > 10 && i.turnoverRate < 10)
      .sort((a, b) => a.turnoverRate - b.turnoverRate)
      .slice(0, 10)
      .map((i) => ({
        productTitle: i.productTitle,
        variantTitle: i.variantTitle,
        quantity: i.quantity,
        soldQuantity: i.soldQuantity,
        turnoverRate: i.turnoverRate,
        inventoryValue: i.inventoryValue,
      }));

    const report = {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalItems,
        totalUnits,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        needsReorderCount,
        outOfStockCount,
      },
      inventoryByCategory,
      lowStockItems,
      reorderItems,
      topSelling,
      slowMoving,
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('[Inventory Reports API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory report' },
      { status: 500 }
    );
  }
}
