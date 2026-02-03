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

  // Convert shopifyId to GID format if it's a raw numeric ID
  const productId = product.shopifyId
    ? (product.shopifyId.startsWith('gid://') ? product.shopifyId : `gid://shopify/Product/${product.shopifyId}`)
    : product.id;

  return {
    // Use Shopify ID in GID format for consistency with Shopify API expectations
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
        // Log info for variants missing shopifyId (test products only)
        // Cart system handles both Shopify GIDs and local UUIDs via /api/v1/products/variant endpoint
        if (!v.shopifyId) {
          console.log(`[Products API] Variant "${v.title}" for "${product.title}" using local UUID (no shopifyId)`);
        }
        // Convert shopifyId to GID format if it's a raw numeric ID
        const variantId = v.shopifyId
          ? (v.shopifyId.startsWith('gid://') ? v.shopifyId : `gid://shopify/ProductVariant/${v.shopifyId}`)
          : v.id;
        return {
        node: {
          // Use shopifyId in GID format for Shopify cart compatibility, fall back to local UUID for custom cart
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

  // Local collection shortcut -- queries Postgres directly and returns
  // Shopify-compatible response format. Skips Shopify entirely.
  const localCollection = searchParams.get('localCollection');
  if (localCollection && isDatabaseConfigured()) {
    try {
      const collectionData = await prisma.category.findUnique({
        where: { handle: localCollection },
      });

      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          categories: { some: { category: { handle: localCollection } } },
        },
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: { include: { image: true }, orderBy: { createdAt: 'asc' } },
          categories: { include: { category: true } },
        },
        orderBy: { title: 'asc' },
        take: first,
      });

      const edges = products.map((product) => ({
        node: transformToShopifyFormat(product),
      }));

      return NextResponse.json(
        {
          products: { edges },
          collection: collectionData
            ? { id: collectionData.id, handle: collectionData.handle, title: collectionData.title, description: collectionData.description || '' }
            : null,
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
      console.error('[Products API] Local collection query failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch local collection', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  // Database variant IDs are now synced with Shopify - use local database
  // Only 3 test products are missing shopifyId (they don't exist in Shopify)
  // Cart system handles ID resolution via /api/v1/products/variant endpoint
  const forceShopify = false;

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

    // Search filter - search across multiple fields with relevance-based ordering
    // We'll handle search separately below for relevance sorting
    const isSearchQuery = !!searchTerm;

    if (searchTerm && !isSearchQuery) {
      // This block is now unused - search handled below
      const searchLower = searchTerm.toLowerCase();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { vendor: { contains: searchTerm, mode: 'insensitive' } },
        { productType: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [searchTerm, searchLower, searchTerm.toUpperCase()] } },
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

    // Shared include for all product queries
    const productInclude = {
      images: {
        orderBy: { position: 'asc' as const },
      },
      variants: {
        include: { image: true },
        orderBy: { createdAt: 'asc' as const },
      },
      categories: {
        include: { category: true },
      },
    };

    let products: ProductWithRelations[];

    // For search queries, use relevance-based ordering:
    // 1. Products where productType matches (highest relevance)
    // 2. Products where title matches
    // 3. Products where description/vendor/tags match
    if (isSearchQuery && searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const baseWhere = { ...where, status: 'ACTIVE' as const };

      // Query 1: productType matches (highest relevance)
      const productTypeMatches = await prisma.product.findMany({
        where: {
          ...baseWhere,
          productType: { contains: searchTerm, mode: 'insensitive' },
        },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      const productTypeIds = new Set(productTypeMatches.map(p => p.id));

      // Query 2: title matches (not already in productType results)
      const titleMatches = await prisma.product.findMany({
        where: {
          ...baseWhere,
          id: { notIn: Array.from(productTypeIds) },
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      const titleIds = new Set(titleMatches.map(p => p.id));
      const usedIds = new Set([...productTypeIds, ...titleIds]);

      // Query 3: other matches (description, vendor, tags)
      const otherMatches = await prisma.product.findMany({
        where: {
          ...baseWhere,
          id: { notIn: Array.from(usedIds) },
          OR: [
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { vendor: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { hasSome: [searchTerm, searchLower, searchTerm.toUpperCase()] } },
          ],
        },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      // Combine results in relevance order, then slice to requested count
      products = [...productTypeMatches, ...titleMatches, ...otherMatches].slice(skip, skip + first);
    } else {
      // Non-search queries: use simple alphabetical ordering
      products = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
        skip,
      });
    }

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
