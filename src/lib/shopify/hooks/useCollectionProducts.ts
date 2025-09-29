import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { ShopifyProduct } from '../types';

interface ProductsApiResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
  collection?: {
    id: string;
    handle: string;
    title: string;
    description: string;
  };
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

export function useCollectionProducts(collectionHandle: string | null, initialLoadCount: number = 20) {
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Build API URL
  const apiUrl = collectionHandle
    ? `/api/products?collection=${collectionHandle}&first=${initialLoadCount}`
    : `/api/products?first=${initialLoadCount}`;

  // Use SWR for caching and revalidation
  const { data, error, isLoading } = useSWR<ProductsApiResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
      keepPreviousData: true, // Keep previous data while loading new data
    }
  );

  // Update products when data changes
  useEffect(() => {
    if (data) {
      const newProducts = data.products.edges.map(edge => edge.node);
      setAllProducts(newProducts);
      setHasNextPage(data.products.pageInfo?.hasNextPage || false);
      setEndCursor(data.products.pageInfo?.endCursor || null);
    }
  }, [data]);

  // Load more products (for pagination)
  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || collectionHandle) return;

    try {
      const url = `/api/products?first=${initialLoadCount}&after=${endCursor}`;
      const response = await fetch(url);
      const moreData: ProductsApiResponse = await response.json();

      const newProducts = moreData.products.edges.map(edge => edge.node);
      setAllProducts(prev => [...prev, ...newProducts]);
      setHasNextPage(moreData.products.pageInfo?.hasNextPage || false);
      setEndCursor(moreData.products.pageInfo?.endCursor || null);
    } catch (err) {
      console.error('Failed to load more products:', err);
    }
  }, [hasNextPage, endCursor, collectionHandle, initialLoadCount]);

  return {
    products: allProducts,
    loading: isLoading && allProducts.length === 0, // Only show loading on initial load
    error: error ? new Error(error.message) : null,
    hasNextPage: !collectionHandle ? hasNextPage : false,
    loadMore,
    collection: data?.collection,
  };
}