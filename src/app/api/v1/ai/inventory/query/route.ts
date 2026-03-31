/**
 * AI Inventory Query API
 * POST /api/v1/ai/inventory/query - Natural language inventory queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import {
  processInventoryQuery,
  getInventoryInsights,
  getLowStockAlerts,
  getReorderRecommendations,
  QUICK_QUERIES,
} from '@/lib/ai/inventory-index';
import type { InventoryItemSummary } from '@/lib/ai/inventory-index';

/**
 * Build inventory context from database
 */
const LOW_STOCK_THRESHOLD = 10;
const REORDER_POINT = 10;

async function buildInventoryContext(): Promise<InventoryItemSummary[]> {
  // Get all product variants with product info
  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          productType: true,
        },
      },
    },
  });

  // Get sales data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentMovements = await prisma.inventoryMovement.findMany({
    where: {
      type: 'SOLD',
      createdAt: { gte: thirtyDaysAgo },
      variantId: { not: null },
    },
    select: {
      variantId: true,
      quantity: true,
      createdAt: true,
    },
  });

  // Calculate sales per variant
  const salesByVariant = new Map<string, number>();
  for (const movement of recentMovements) {
    if (!movement.variantId) continue;
    const current = salesByVariant.get(movement.variantId) || 0;
    salesByVariant.set(movement.variantId, current + Math.abs(movement.quantity));
  }

  // Map to InventoryItemSummary
  return variants.map((variant) => ({
    id: variant.id,
    name: `${variant.product.title}${variant.title !== 'Default' ? ` - ${variant.title}` : ''}`,
    sku: variant.sku || variant.id,
    quantity: variant.inventoryQuantity,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    reorderPoint: REORDER_POINT,
    category: variant.product.productType || undefined,
    price: variant.price ? Number(variant.price) : undefined,
    salesLast30Days: salesByVariant.get(variant.id) || 0,
  }));
}

/**
 * POST /api/v1/ai/inventory/query
 * Process natural language inventory query
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { query, quickQuery, userId } = body as {
      query?: string;
      quickQuery?: 'insights' | 'low_stock' | 'reorder';
      userId?: string;
    };

    if (!query && !quickQuery) {
      return NextResponse.json(
        { success: false, error: 'Query or quickQuery is required' },
        { status: 400 }
      );
    }

    // Build inventory context
    const inventoryContext = await buildInventoryContext();

    // Process the appropriate query type
    let result;
    if (quickQuery === 'insights') {
      result = await getInventoryInsights(inventoryContext);
    } else if (quickQuery === 'low_stock') {
      result = await getLowStockAlerts(inventoryContext);
    } else if (quickQuery === 'reorder') {
      result = await getReorderRecommendations(inventoryContext);
    } else if (query) {
      result = await processInventoryQuery(query, inventoryContext);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process query' },
        { status: 500 }
      );
    }

    // Save query to database for analytics
    // Note: Additional fields like queryType are stored in the response JSON
    await prisma.aIInventoryQuery.create({
      data: {
        query: query || `Quick query: ${quickQuery}`,
        response: JSON.stringify({
          answer: result.data.answer,
          queryType: result.data.queryType,
          relevantItemIds: result.data.relevantItems?.map((i) => i.id) || [],
          suggestedActions: result.data.suggestedActions || [],
        }),
        createdBy: userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[AI Inventory] Query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process query',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/ai/inventory/query
 * Get quick query options and query history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const history = searchParams.get('history') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (history) {
      // Return recent query history
      const queries = await prisma.aIInventoryQuery.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          query: true,
          response: true,
          createdAt: true,
        },
      });

      // Parse response JSON to extract queryType
      const parsedQueries = queries.map((q) => {
        try {
          const parsed = JSON.parse(q.response);
          return {
            id: q.id,
            query: q.query,
            queryType: parsed.queryType,
            createdAt: q.createdAt,
          };
        } catch {
          return {
            id: q.id,
            query: q.query,
            queryType: 'general',
            createdAt: q.createdAt,
          };
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          queries: parsedQueries,
          quickQueries: QUICK_QUERIES,
        },
      });
    }

    // Return quick query options
    return NextResponse.json({
      success: true,
      data: {
        quickQueries: QUICK_QUERIES,
      },
    });
  } catch (error) {
    console.error('[AI Inventory] Get queries error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get queries',
      },
      { status: 500 }
    );
  }
}
