/**
 * Variant Lookup API
 * Returns product and variant details by variant ID
 * Used by cart system to resolve product info when adding items
 *
 * Supports both:
 * - Shopify GIDs: gid://shopify/ProductVariant/12345
 * - Local UUIDs: 550e8400-e29b-41d4-a716-446655440000
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

/**
 * Parse variant ID to determine lookup strategy
 * Returns { type: 'shopify', id: '12345' } or { type: 'local', id: 'uuid' }
 */
function parseVariantId(variantId: string): { type: 'shopify' | 'local'; id: string } {
  // Check for Shopify GID format
  if (variantId.startsWith('gid://shopify/ProductVariant/')) {
    return {
      type: 'shopify',
      id: variantId.replace('gid://shopify/ProductVariant/', ''),
    };
  }

  // Check for just numeric ID (also Shopify)
  if (/^\d+$/.test(variantId)) {
    return { type: 'shopify', id: variantId };
  }

  // Otherwise treat as local UUID
  return { type: 'local', id: variantId };
}

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
    const parsed = parseVariantId(variantId);

    // Query by shopifyId or local id based on format
    const variant = parsed.type === 'shopify'
      ? await prisma.productVariant.findUnique({
          where: { shopifyId: parsed.id },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                handle: true,
                shopifyId: true,
              },
            },
            image: {
              select: {
                url: true,
                altText: true,
              },
            },
          },
        })
      : await prisma.productVariant.findUnique({
          where: { id: parsed.id },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                handle: true,
                shopifyId: true,
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
