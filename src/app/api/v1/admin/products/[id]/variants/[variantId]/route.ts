/**
 * Admin Product Variant API
 * GET /api/v1/admin/products/[id]/variants/[variantId] - Get variant details
 * PUT /api/v1/admin/products/[id]/variants/[variantId] - Update variant
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

interface RouteParams {
  params: Promise<{ id: string; variantId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: productId, variantId } = await params;

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: productId,
      },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        price: Number(variant.price),
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        costPerUnit: variant.costPerUnit ? Number(variant.costPerUnit) : null,
        inventoryQuantity: variant.inventoryQuantity,
        trackInventory: variant.trackInventory,
        allowBackorder: variant.allowBackorder,
        availableForSale: variant.availableForSale,
        weight: variant.weight ? Number(variant.weight) : null,
        weightUnit: variant.weightUnit,
      },
    });
  } catch (error) {
    console.error('[Variant API] Error fetching variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: productId, variantId } = await params;
    const body = await request.json();

    // Verify variant belongs to product
    const existing = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: productId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Build variant update data
    const variantUpdate: {
      price?: number;
      compareAtPrice?: number | null;
      trackInventory?: boolean;
      allowBackorder?: boolean;
      availableForSale?: boolean;
      inventoryQuantity?: number;
    } = {};

    if (body.price !== undefined) {
      variantUpdate.price = parseFloat(body.price);
    }

    if (body.compareAtPrice !== undefined) {
      variantUpdate.compareAtPrice = body.compareAtPrice ? parseFloat(body.compareAtPrice) : null;
    }

    if (body.trackInventory !== undefined) {
      variantUpdate.trackInventory = Boolean(body.trackInventory);
    }

    if (body.allowBackorder !== undefined) {
      variantUpdate.allowBackorder = Boolean(body.allowBackorder);
    }

    if (body.availableForSale !== undefined) {
      variantUpdate.availableForSale = Boolean(body.availableForSale);
    }

    // Handle inventory adjustment (single source of truth: ProductVariant.inventoryQuantity)
    if (body.inventoryAdjustment !== undefined) {
      const { type, value } = body.inventoryAdjustment;
      const adjustValue = parseInt(value);

      if (type === 'set') {
        variantUpdate.inventoryQuantity = adjustValue;
      } else if (type === 'add') {
        variantUpdate.inventoryQuantity = existing.inventoryQuantity + adjustValue;
      } else if (type === 'remove') {
        variantUpdate.inventoryQuantity = Math.max(0, existing.inventoryQuantity - adjustValue);
      }
    }

    // Update variant
    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: variantUpdate,
    });

    // Recalculate product total inventory
    const allVariants = await prisma.productVariant.findMany({
      where: { productId },
      select: { inventoryQuantity: true },
    });
    const totalInventory = allVariants.reduce((sum, v) => sum + v.inventoryQuantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        price: Number(updated.price),
        inventoryQuantity: updated.inventoryQuantity,
        trackInventory: updated.trackInventory,
        allowBackorder: updated.allowBackorder,
        availableForSale: updated.availableForSale,
        productTotalInventory: totalInventory,
      },
    });
  } catch (error) {
    console.error('[Variant API] Error updating variant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}
