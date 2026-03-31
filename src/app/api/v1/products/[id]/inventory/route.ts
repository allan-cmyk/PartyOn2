/**
 * Product Inventory API
 *
 * GET /api/v1/products/:id/inventory - Get inventory for a product
 * GET /api/v1/products/:id/inventory/history - Get movement history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/inventory/services/product-service';
import {
  getProductInventory,
  getMovementHistory,
} from '@/lib/inventory/services/inventory-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/products/:id/inventory
 * Get inventory for a product across all locations
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const includeHistory = request.nextUrl.searchParams.get('history') === 'true';

    // Verify product exists
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const inventory = await getProductInventory(product.id);

    // Calculate totals
    const totalQuantity = inventory.reduce((sum, item) => sum + item.inventoryQuantity, 0);
    const availableQuantity = totalQuantity;

    const response: {
      success: boolean;
      data: {
        productId: string;
        productTitle: string;
        inventory: typeof inventory;
        totals: {
          totalQuantity: number;
          reservedQuantity: number;
          availableQuantity: number;
          locationCount: number;
        };
        history?: Awaited<ReturnType<typeof getMovementHistory>>;
      };
    } = {
      success: true,
      data: {
        productId: product.id,
        productTitle: product.title,
        inventory,
        totals: {
          totalQuantity,
          reservedQuantity: 0,
          availableQuantity,
          locationCount: 1,
        },
      },
    };

    if (includeHistory) {
      response.data.history = await getMovementHistory(product.id, { limit: 20 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Product Inventory API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory',
      },
      { status: 500 }
    );
  }
}
