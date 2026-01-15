/**
 * Product Variants API - List and Create
 *
 * GET /api/v1/products/:id/variants - List variants for a product
 * POST /api/v1/products/:id/variants - Create a new variant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/inventory/services/product-service';
import {
  getVariantsByProduct,
  createVariant,
} from '@/lib/inventory/services/variant-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/products/:id/variants
 * List all variants for a product
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Verify product exists
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const variants = await getVariantsByProduct(product.id);

    return NextResponse.json({
      success: true,
      data: variants,
      meta: { count: variants.length },
    });
  } catch (error) {
    console.error('[Variants API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch variants',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/products/:id/variants
 * Create a new variant for a product
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify product exists
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (body.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Price is required' },
        { status: 400 }
      );
    }

    const variant = await createVariant({
      productId: product.id,
      sku: body.sku,
      title: body.title,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      option1Name: body.option1Name,
      option1Value: body.option1Value,
      option2Name: body.option2Name,
      option2Value: body.option2Value,
      option3Name: body.option3Name,
      option3Value: body.option3Value,
      inventoryQuantity: body.inventoryQuantity,
      trackInventory: body.trackInventory,
      allowBackorder: body.allowBackorder,
      weight: body.weight,
      weightUnit: body.weightUnit,
    });

    return NextResponse.json(
      { success: true, data: variant },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Variants API] POST error:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'A variant with this SKU already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create variant',
      },
      { status: 500 }
    );
  }
}
