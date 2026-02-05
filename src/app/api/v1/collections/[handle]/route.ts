/**
 * Single Collection API - Get collection with products
 *
 * GET /api/v1/collections/:handle - Get collection details and products
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: Promise<{ handle: string }>;
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: { include: { image: true } };
    categories: { include: { category: true } };
  };
}>;

/**
 * Transform Prisma product to Shopify-compatible format.
 * Keeps backwards compatibility with existing frontend components.
 */
function transformProduct(product: ProductWithRelations): Record<string, unknown> {
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : Number(product.basePrice);

  const productId = product.shopifyId
    ? (product.shopifyId.startsWith('gid://') ? product.shopifyId : `gid://shopify/Product/${product.shopifyId}`)
    : product.id;

  return {
    id: productId,
    handle: product.handle,
    title: product.title,
    description: product.description || '',
    descriptionHtml: product.descriptionHtml || '',
    vendor: product.vendor || '',
    productType: product.productType || '',
    tags: product.tags,
    availableForSale: product.status === 'ACTIVE' && product.variants.some(v => v.availableForSale),
    priceRange: {
      minVariantPrice: {
        amount: minPrice.toFixed(2),
        currencyCode: product.currencyCode,
      },
    },
    images: {
      edges: product.images.map(img => ({
        node: {
          url: img.url,
          altText: img.altText,
          width: img.width || 800,
          height: img.height || 800,
        },
      })),
    },
    variants: {
      edges: product.variants.map(v => {
        const variantId = v.shopifyId
          ? (v.shopifyId.startsWith('gid://') ? v.shopifyId : `gid://shopify/ProductVariant/${v.shopifyId}`)
          : v.id;
        return {
          node: {
            id: variantId,
            title: v.title,
            availableForSale: v.availableForSale,
            quantityAvailable: v.inventoryQuantity,
            price: {
              amount: Number(v.price).toFixed(2),
              currencyCode: product.currencyCode,
            },
            compareAtPrice: v.compareAtPrice ? {
              amount: Number(v.compareAtPrice).toFixed(2),
              currencyCode: product.currencyCode,
            } : undefined,
            selectedOptions: [
              v.option1Name && v.option1Value ? { name: v.option1Name, value: v.option1Value } : null,
              v.option2Name && v.option2Value ? { name: v.option2Name, value: v.option2Value } : null,
              v.option3Name && v.option3Value ? { name: v.option3Name, value: v.option3Value } : null,
            ].filter(Boolean),
            image: v.image ? {
              url: v.image.url,
              altText: v.image.altText,
            } : undefined,
          },
        };
      }),
    },
    collections: {
      edges: product.categories.map(pc => ({
        node: {
          handle: pc.category.handle,
          title: pc.category.title,
        },
      })),
    },
    metafield: product.abv ? {
      value: product.abv.toString(),
      type: 'single_line_text_field',
    } : null,
  };
}

/**
 * GET /api/v1/collections/:handle
 * Get collection details with paginated products
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { handle } = await params;
    const searchParams = request.nextUrl.searchParams;
    const first = parseInt(searchParams.get('first') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'title';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    const category = await prisma.category.findUnique({
      where: { handle },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * first;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'price'
        ? { basePrice: sortOrder }
        : { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          categories: { some: { categoryId: category.id } },
        },
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: { include: { image: true }, orderBy: { createdAt: 'asc' } },
          categories: { include: { category: true } },
        },
        orderBy,
        take: first,
        skip,
      }),
      prisma.product.count({
        where: {
          status: 'ACTIVE',
          categories: { some: { categoryId: category.id } },
        },
      }),
    ]);

    const edges = products.map(product => ({
      node: transformProduct(product),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          collection: {
            id: category.id,
            handle: category.handle,
            title: category.title,
            description: category.description || '',
            imageUrl: category.imageUrl,
          },
          products: { edges },
        },
        meta: {
          total,
          page,
          pageSize: first,
          hasMore: skip + products.length < total,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[Collections API] GET by handle error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch collection',
      },
      { status: 500 }
    );
  }
}
