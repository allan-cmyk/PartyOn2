import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCTS_GRID_QUERY, COLLECTION_GRID_QUERY } from '@/lib/shopify/queries/products';
import { buildShopifyQuery, buildCategoryQuery, combineQueries, ProductFilters } from '@/lib/shopify/query-builder';

// Cache products for 5 minutes
export const revalidate = 300;

import { ShopifyProduct } from '@/lib/shopify/types';

interface ProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

interface CollectionResponse {
  collectionByHandle: {
    id: string;
    handle: string;
    title: string;
    description: string;
    products: {
      edges: Array<{
        node: ShopifyProduct;
      }>;
    };
  };
}

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

  try {
    let data;

    if (collection) {
      // Fetch collection products
      data = await shopifyFetch<CollectionResponse>({
        query: COLLECTION_GRID_QUERY,
        variables: { handle: collection, first: 100 },
      });

      // Transform collection response to match products response structure
      return NextResponse.json(
        {
          products: data.collectionByHandle.products,
          collection: {
            id: data.collectionByHandle.id,
            handle: data.collectionByHandle.handle,
            title: data.collectionByHandle.title,
            description: data.collectionByHandle.description,
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
    } else {
      // Build Shopify query with server-side filtering
      const filters: ProductFilters = {
        searchTerm,
        tags,
        priceMin,
        priceMax,
      };

      const queries: string[] = [];

      // Add category filter
      if (category && category !== 'all') {
        const categoryQuery = buildCategoryQuery(category);
        if (categoryQuery) queries.push(categoryQuery);
      }

      // Add other filters
      const filterQuery = buildShopifyQuery(filters);
      if (filterQuery) queries.push(filterQuery);

      // Combine all queries
      const finalQuery = combineQueries(...queries);

      // Fetch all products with server-side filtering
      const variables: Record<string, string | number> = { first };

      if (after) {
        variables.after = after;
      }

      if (finalQuery) {
        variables.query = finalQuery;
        console.log('Shopify Query:', finalQuery); // Debug log
      }

      data = await shopifyFetch<ProductsResponse>({
        query: PRODUCTS_GRID_QUERY,
        variables,
      });

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      });
    }
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}