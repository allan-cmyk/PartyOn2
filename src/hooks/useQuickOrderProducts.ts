/**
 * @fileoverview SWR hook for fetching products by collection for Quick Order page
 * @module hooks/useQuickOrderProducts
 */

import useSWR from 'swr';
import type { Product } from '@/lib/types';

interface ProductsResponse {
  products: {
    edges: Array<{
      node: Product;
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
 * Hook for fetching products by collection handle with SWR caching
 *
 * @param collectionHandle - Shopify collection handle (e.g., 'favorites-home-page', 'cocktail-kits')
 * @returns Products array with loading and error states
 *
 * @example
 * ```tsx
 * const { products, loading, error } = useQuickOrderProducts('cocktail-kits');
 * ```
 */
export function useQuickOrderProducts(collectionHandle: string): {
  products: Product[];
  loading: boolean;
  error: Error | undefined;
} {
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
