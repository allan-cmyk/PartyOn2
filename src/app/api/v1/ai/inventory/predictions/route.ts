/**
 * AI Stock Predictions API
 * GET/POST /api/v1/ai/inventory/predictions - Stock predictions and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import {
  predictStockForProduct,
  predictStockBatch,
  quickPredict,
} from '@/lib/ai/inventory-index';
import type { PredictionProduct, SalesDataPoint } from '@/lib/ai/inventory-index';

/**
 * Build prediction products from database
 */
const LOW_STOCK_THRESHOLD = 10;
const REORDER_POINT = 10;

async function buildPredictionProducts(
  productIds?: string[]
): Promise<PredictionProduct[]> {
  // Get product variants with product info
  const variants = await prisma.productVariant.findMany({
    where: productIds ? { productId: { in: productIds } } : undefined,
    include: {
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Get sales history for the last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const variantIds = variants.map((v) => v.id);

  const salesMovements = await prisma.inventoryMovement.findMany({
    where: {
      type: 'SOLD',
      createdAt: { gte: ninetyDaysAgo },
      variantId: { in: variantIds },
    },
    select: {
      variantId: true,
      quantity: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group sales by variant
  const salesByVariant = new Map<string, SalesDataPoint[]>();
  for (const movement of salesMovements) {
    if (!movement.variantId) continue;
    if (!salesByVariant.has(movement.variantId)) {
      salesByVariant.set(movement.variantId, []);
    }
    salesByVariant.get(movement.variantId)!.push({
      date: movement.createdAt,
      quantity: Math.abs(movement.quantity),
    });
  }

  // Build prediction products
  return variants.map((variant) => ({
    id: variant.id,
    name: `${variant.product.title}${variant.title !== 'Default' ? ` - ${variant.title}` : ''}`,
    currentStock: variant.inventoryQuantity,
    reorderPoint: REORDER_POINT,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    leadTimeDays: 7, // Default lead time, could be per-product
    unitCost: variant.costPerUnit ? Number(variant.costPerUnit) : undefined,
    salesHistory: salesByVariant.get(variant.id) || [],
  }));
}

/**
 * GET /api/v1/ai/inventory/predictions
 * Get stock predictions for all or specific products
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const urgencyFilter = searchParams.get('urgency');
    const quick = searchParams.get('quick') === 'true';

    // Build prediction products
    const products = await buildPredictionProducts(
      productId ? [productId] : undefined
    );

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          predictions: [],
          criticalItems: [],
          upcomingStockouts: [],
          generatedAt: new Date(),
        },
      });
    }

    // Use quick local predictions or AI-powered predictions
    if (quick) {
      // Fast local predictions (no AI call)
      const predictions = products.map((p) => quickPredict(p));

      const criticalItems = predictions.filter((p) => p.urgency === 'critical');
      const upcomingStockouts = predictions.filter(
        (p) =>
          p.predictedDaysUntilStockout !== null &&
          p.predictedDaysUntilStockout <= 14
      );

      // Apply urgency filter if provided
      const filteredPredictions = urgencyFilter
        ? predictions.filter((p) => p.urgency === urgencyFilter)
        : predictions;

      return NextResponse.json({
        success: true,
        data: {
          predictions: filteredPredictions,
          criticalItems,
          upcomingStockouts,
          generatedAt: new Date(),
          method: 'quick',
        },
      });
    }

    // AI-powered predictions
    if (productId && products.length === 1) {
      // Single product prediction
      const result = await predictStockForProduct(products[0]);

      if (!result.success || !result.data) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to generate prediction' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          predictions: [result.data],
          criticalItems: result.data.urgency === 'critical' ? [result.data] : [],
          upcomingStockouts:
            result.data.predictedDaysUntilStockout !== null &&
            result.data.predictedDaysUntilStockout <= 14
              ? [result.data]
              : [],
          generatedAt: new Date(),
          method: 'ai',
        },
        confidence: result.confidence,
      });
    }

    // Batch predictions
    const result = await predictStockBatch(products);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate predictions' },
        { status: 500 }
      );
    }

    // Apply urgency filter if provided
    const filteredPredictions = urgencyFilter
      ? result.data.predictions.filter((p) => p.urgency === urgencyFilter)
      : result.data.predictions;

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        predictions: filteredPredictions,
        method: 'ai',
      },
    });
  } catch (error) {
    console.error('[AI Inventory] Predictions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate predictions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ai/inventory/predictions
 * Generate predictions for specific products with custom parameters
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { productIds, leadTimeDays } = body as {
      productIds?: string[];
      leadTimeDays?: number;
    };

    // Build prediction products
    let products = await buildPredictionProducts(productIds);

    // Override lead time if provided
    if (leadTimeDays !== undefined) {
      products = products.map((p) => ({
        ...p,
        leadTimeDays,
      }));
    }

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          predictions: [],
          criticalItems: [],
          upcomingStockouts: [],
          generatedAt: new Date(),
        },
      });
    }

    // Generate predictions
    const result = await predictStockBatch(products);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate predictions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[AI Inventory] Predictions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate predictions',
      },
      { status: 500 }
    );
  }
}
