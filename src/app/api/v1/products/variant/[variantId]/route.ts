/**
 * Variant Lookup API
 * Returns product and variant details by variant ID
 * Used by cart system to resolve product info when adding items
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params;

  if (!variantId) {
    return NextResponse.json(
      { error: 'Variant ID is required' },
      { status: 400 }
    );
  }

  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            handle: true,
          },
        },
        image: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      variantId: variant.id,
      productId: variant.productId,
      title: variant.title,
      sku: variant.sku,
      price: variant.price.toString(),
      compareAtPrice: variant.compareAtPrice?.toString() || null,
      availableForSale: variant.availableForSale,
      inventoryQuantity: variant.inventoryQuantity,
      product: {
        id: variant.product.id,
        title: variant.product.title,
        handle: variant.product.handle,
      },
      image: variant.image ? {
        url: variant.image.url,
        altText: variant.image.altText,
      } : null,
    });
  } catch (error) {
    console.error('Variant lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
