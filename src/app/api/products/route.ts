import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { shopifyFetch } from '@/lib/shopify/client';
import { COLLECTION_GRID_QUERY, PRODUCTS_GRID_QUERY } from '@/lib/shopify/queries/products';
import type { ShopifyProduct } from '@/lib/shopify/types';

// Helper type for Shopify product edges
interface ProductEdges {
  edges: Array<{ node: ShopifyProduct }>;
  pageInfo?: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

// Cache products for 5 minutes
export const revalidate = 300;

/**
 * Fetch products directly from Shopify Storefront API
 * Used as fallback when database isn't configured
 */
async function fetchFromShopify(collectionHandle: string | null, first: number = 100) {
  try {
    if (collectionHandle) {
      // Fetch collection with products
      const data = await shopifyFetch<{
        collectionByHandle: {
          id: string;
          handle: string;
          title: string;
          description: string;
          products: ProductEdges;
        } | null;
      }>({
        query: COLLECTION_GRID_QUERY,
        variables: { handle: collectionHandle, first },
      });

      if (!data.collectionByHandle) {
        return { products: { edges: [] }, collection: null };
      }

      return {
        products: data.collectionByHandle.products,
        collection: {
          id: data.collectionByHandle.id,
          handle: data.collectionByHandle.handle,
          title: data.collectionByHandle.title,
          description: data.collectionByHandle.description || '',
        },
      };
    } else {
      // Fetch all products
      const data = await shopifyFetch<{
        products: ProductEdges;
      }>({
        query: PRODUCTS_GRID_QUERY,
        variables: { first },
      });

      return {
        products: data.products,
      };
    }
  } catch (error) {
    console.error('[Products API] Shopify fallback error:', error);
    throw error;
  }
}

/**
 * Transform Prisma product data to Shopify-compatible format
 * This ensures backwards compatibility with existing frontend code
 */
function transformToShopifyFormat(product: ProductWithRelations) {
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : Number(product.basePrice);

  return {
    // Use Shopify ID if available for consistency with Shopify API expectations
    id: product.shopifyId || product.id,
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
        // CRITICAL: Warn if variant is missing Shopify ID (cart will fail)
        if (!v.shopifyId) {
          console.warn(`[Products API] Variant "${v.title}" for product "${product.title}" missing shopifyId - cart add will fail!`);
        }
        return {
        node: {
          // CRITICAL: Use shopifyId for cart operations, fall back to Prisma id if not synced
          id: v.shopifyId || v.id,
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

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: { include: { image: true } };
    categories: { include: { category: true } };
  };
}>;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const collection = searchParams.get('collection');
  const first = parseInt(searchParams.get('first') || '20');
  const after = searchParams.get('after');
  const searchTerm = searchParams.get('search');
  const category = searchParams.get('category');
  const tags = searchParams.get('tags')?.split(',').filter(Boolean);
  const priceMin = searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined;
  const priceMax = searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined;

  // TEMPORARY FIX: Always use Shopify directly until database variants have shopifyId populated
  // The database stores Prisma UUIDs as variant IDs, but Shopify cart requires Shopify GIDs
  // This ensures cart add operations work correctly
  const forceShopify = true; // Set to false once database is properly synced with Shopify IDs

  // Check if database is configured - if not, use Shopify directly
  // This ensures cart adds work (Shopify cart expects Shopify GIDs)
  if (!isDatabaseConfigured() || forceShopify) {
    console.log('[Products API] Using Shopify directly for cart-compatible product data');
    try {
      const collectionHandle = collection || category;
      const result = await fetchFromShopify(collectionHandle, first);

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      });
    } catch (error) {
      console.error('[Products API] Shopify fallback failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products from Shopify', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  try {
    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE', // Only show active products
    };

    // Collection/Category filter
    if (collection) {
      where.categories = {
        some: {
          category: {
            handle: collection,
          },
        },
      };
    } else if (category && category !== 'all') {
      where.categories = {
        some: {
          category: {
            handle: category,
          },
        },
      };
    }

    // Search filter
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { vendor: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
      ];
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Price filter (on base price)
    if (priceMin !== undefined || priceMax !== undefined) {
      where.basePrice = {};
      if (priceMin !== undefined) {
        where.basePrice.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.basePrice.lte = priceMax;
      }
    }

    // Handle pagination cursor
    let skip = 0;
    if (after) {
      // Find the position of the cursor product
      const cursorProduct = await prisma.product.findUnique({
        where: { id: after },
        select: { createdAt: true },
      });
      if (cursorProduct) {
        const count = await prisma.product.count({
          where: {
            ...where,
            createdAt: { lt: cursorProduct.createdAt },
          },
        });
        skip = count + 1;
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Fetch products with relations
    const products = await prisma.product.findMany({
      where,
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
      orderBy: { title: 'asc' },
      take: first,
      skip,
    });

    // Transform to Shopify-compatible format
    const edges = products.map(product => ({
      node: transformToShopifyFormat(product),
    }));

    // Determine pagination info
    const hasNextPage = skip + products.length < totalCount;
    const endCursor = products.length > 0 ? products[products.length - 1].id : null;

    // If collection was requested, also get collection info
    if (collection) {
      const collectionData = await prisma.category.findUnique({
        where: { handle: collection },
      });

      return NextResponse.json(
        {
          products: { edges },
          collection: collectionData ? {
            id: collectionData.id,
            handle: collectionData.handle,
            title: collectionData.title,
            description: collectionData.description || '',
          } : null,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'CDN-Cache-Control': 'public, s-maxage=300',
            'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          },
        }
      );
    }

    return NextResponse.json(
      {
        products: {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor,
          },
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      }
    );
  } catch (error) {
    console.error('[Products API] Database error, falling back to Shopify:', error);

    // Fall back to Shopify if database query fails
    try {
      const collectionHandle = collection || category;
      const result = await fetchFromShopify(collectionHandle, first);

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      });
    } catch (shopifyError) {
      console.error('[Products API] Shopify fallback also failed:', shopifyError);
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
