/**
 * Single Variant API - Get, Update, Delete
 *
 * GET /api/v1/variants/:id - Get single variant
 * PUT /api/v1/variants/:id - Update variant
 * DELETE /api/v1/variants/:id - Delete variant
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getVariant,
  updateVariant,
  deleteVariant,
} from '@/lib/inventory/services/variant-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/variants/:id
 * Get single variant by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const variant = await getVariant(id);

    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: variant });
  } catch (error) {
    console.error('[Variants API] GET by ID error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch variant',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/variants/:id
 * Update an existing variant
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify variant exists
    const existing = await getVariant(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    const variant = await updateVariant({
      id,
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

    return NextResponse.json({ success: true, data: variant });
  } catch (error) {
    console.error('[Variants API] PUT error:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'A variant with this SKU already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update variant',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/variants/:id
 * Delete a variant
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Verify variant exists
    const existing = await getVariant(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    await deleteVariant(id);

    return NextResponse.json({
      success: true,
      message: 'Variant deleted',
    });
  } catch (error) {
    console.error('[Variants API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete variant',
      },
      { status: 500 }
    );
  }
}
