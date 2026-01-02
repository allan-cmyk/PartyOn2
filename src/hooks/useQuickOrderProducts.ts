/**
 * @fileoverview SWR hook for fetching products by category for Quick Order page
 * @module hooks/useQuickOrderProducts
 */

import useSWR from 'swr';
import type { ShopifyProduct } from '@/lib/shopify/types';

/**
 * Category to Shopify collection handle mapping
 */
const CATEGORY_MAP: Record<string, string> = {
  all: 'favorites-home-page',
  beer: 'tailgate-beer',
  seltzers: 'seltzer-collection',
  'cocktail-kits': 'cocktail-kits',
  liquor: 'spirits',
  mixers: 'mixers-non-alcoholic',
  wine: 'champagne',
  supplies: 'party-supplies',
};

/**
 * Category definitions for the UI
 */
export const QUICK_ORDER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'beer', label: 'Beer' },
  { id: 'seltzers', label: 'Seltzers' },
  { id: 'cocktail-kits', label: 'Cocktail Kits' },
  { id: 'liquor', label: 'Liquor' },
  { id: 'mixers', label: 'Mixers/NA' },
  { id: 'wine', label: 'Wine' },
  { id: 'supplies', label: 'Supplies' },
];

interface ProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

const fetcher = async (url: string): Promise<ProductsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
};

/**
 * Hook for fetching products by category with SWR caching
 *
 * @param category - Category ID from QUICK_ORDER_CATEGORIES
 * @returns Products array with loading and error states
 *
 * @example
 * ```tsx
 * const { products, loading, error } = useQuickOrderProducts('beer');
 * ```
 */
export function useQuickOrderProducts(category: string): {
  products: ShopifyProduct[];
  loading: boolean;
  error: Error | undefined;
} {
  const collectionHandle = CATEGORY_MAP[category] ?? CATEGORY_MAP.all;

  const { data, error, isLoading } = useSWR<ProductsResponse>(
    `/api/products?collection=${collectionHandle}&first=100`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    products: data?.products?.edges?.map((e) => e.node) ?? [],
    loading: isLoading,
    error,
  };
}
