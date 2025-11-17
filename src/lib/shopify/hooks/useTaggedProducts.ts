import useSWR from 'swr';
import { ShopifyProduct } from '../types';

interface ProductsAPIResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

interface UseTaggedProductsOptions {
  tags: string[];
  enabled?: boolean;
}

/**
 * Hook to fetch products by tags using the optimized API route
 *
 * @param options - Configuration options
 * @param options.tags - Array of tags to filter by
 * @param options.enabled - Whether to fetch immediately (default: true)
 * @returns Products, loading state, and error
 *
 * @example
 * const { products, loading, error } = useTaggedProducts({
 *   tags: ['bach-party', 'bachelorette']
 * });
 */
export function useTaggedProducts({ tags, enabled = true }: UseTaggedProductsOptions) {
  const tagsParam = tags.join(',');

  const { data, error, isLoading, mutate } = useSWR<ProductsAPIResponse>(
    enabled && tags.length > 0 ? `/api/products?tags=${tagsParam}&first=100` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes - matches API cache
    }
  );

  const products = data?.products?.edges.map(edge => edge.node) || [];

  return {
    products,
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
