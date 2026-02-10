import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';

// Cache products for 5 minutes
export const revalidate = 300;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: { include: { image: true } };
    categories: { include: { category: true } };
  };
}>;

/**
 * Transform Prisma product data to Shopify-compatible format
 * This ensures backwards compatibility with existing frontend code
 */
function transformToShopifyFormat(product: ProductWithRelations) {
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : Number(product.basePrice);

  return {
    id: product.id,
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
      edges: product.variants.map(v => ({
        node: {
          id: v.id,
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
          ].filter(Boolean) as Array<{ name: string; value: string }>,
          image: v.image ? {
            url: v.image.url,
            altText: v.image.altText,
          } : undefined,
        },
      })),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  if (!handle) {
    return NextResponse.json(
      { error: 'Product handle is required' },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { handle },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
        variants: {
          include: { image: true },
          orderBy: { createdAt: 'asc' },
        },
        categories: {
          include: { category: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform to Shopify-compatible format for backwards compatibility
    const transformedProduct = transformToShopifyFormat(product);

    return NextResponse.json(transformedProduct, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Product API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
