/**
 * Custom Products Hooks
 * Fetches product data from PostgreSQL via /api/products and /api/v1/products
 * Drop-in replacements for Shopify product hooks
 */

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Product } from '@/lib/types';

interface ProductsApiResponse {
  products: {
    edges: Array<{ node: Product }>;
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

interface SingleProductApiResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

/**
 * Fetch products from custom PostgreSQL API.
 * Replaces useProducts from Shopify hooks.
 */
export function useCustomProducts(first: number = 20, loadAll: boolean = false) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const apiUrl = `/api/products?first=${loadAll ? 250 : first}`;

  const { data, error, isLoading } = useSWR<ProductsApiResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
    }
  );

  useEffect(() => {
    if (!data) return;

    const products = data.products.edges.map(edge => edge.node);

    if (loadAll && data.products.pageInfo?.hasNextPage) {
      // Recursively load remaining pages
      setAllProducts(products);
      setHasNextPage(true);
      setEndCursor(data.products.pageInfo.endCursor);
      loadRemainingPages(products, data.products.pageInfo.endCursor);
    } else {
      setAllProducts(products);
      setHasNextPage(data.products.pageInfo?.hasNextPage || false);
      setEndCursor(data.products.pageInfo?.endCursor || null);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRemainingPages = async (existing: Product[], cursor: string) => {
    let accumulated = [...existing];
    let currentCursor: string | null = cursor;

    while (currentCursor) {
      try {
        const response = await fetch(`/api/products?first=250&after=${currentCursor}`);
        const pageData: ProductsApiResponse = await response.json();
        const newProducts = pageData.products.edges.map(edge => edge.node);
        accumulated = [...accumulated, ...newProducts];
        setAllProducts([...accumulated]);

        if (pageData.products.pageInfo?.hasNextPage) {
          currentCursor = pageData.products.pageInfo.endCursor;
        } else {
          currentCursor = null;
        }
      } catch {
        break;
      }
    }

    setHasNextPage(false);
    setEndCursor(null);
  };

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/products?first=${first}&after=${endCursor}`);
      const moreData: ProductsApiResponse = await response.json();

      const newProducts = moreData.products.edges.map(edge => edge.node);
      setAllProducts(prev => [...prev, ...newProducts]);
      setHasNextPage(moreData.products.pageInfo?.hasNextPage || false);
      setEndCursor(moreData.products.pageInfo?.endCursor || null);
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, endCursor, first, isLoadingMore]);

  return {
    products: allProducts,
    loading: isLoading && allProducts.length === 0,
    error: error ? new Error(error.message) : null,
    hasNextPage,
    loadMore,
  };
}

/**
 * Fetch products filtered by collection from custom PostgreSQL API.
 * Replaces useCollectionProducts from Shopify hooks.
 */
export function useCustomCollectionProducts(
  collectionHandle: string | null,
  initialLoadCount: number = 20
) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const apiUrl = collectionHandle
    ? `/api/products?collection=${collectionHandle}&first=${initialLoadCount}`
    : `/api/products?first=${initialLoadCount}`;

  const { data, error, isLoading } = useSWR<ProductsApiResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (data) {
      const newProducts = data.products.edges.map(edge => edge.node);
      setAllProducts(newProducts);
      setHasNextPage(data.products.pageInfo?.hasNextPage || false);
      setEndCursor(data.products.pageInfo?.endCursor || null);
    }
  }, [data]);

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
    loading: isLoading && allProducts.length === 0,
    error: error ? new Error(error.message) : null,
    hasNextPage: !collectionHandle ? hasNextPage : false,
    loadMore,
    collection: data?.collection,
  };
}

/**
 * Fetch a single product by handle from custom PostgreSQL API.
 * Replaces useProduct from Shopify hooks.
 */
export function useCustomProduct(handle: string) {
  const { data, error, isLoading } = useSWR<SingleProductApiResponse>(
    handle ? `/api/v1/products/${encodeURIComponent(handle)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  // The /api/v1/products/[id] returns raw Prisma data, not transformed
  // For now return null - product detail pages use server components with direct DB access
  const product = data?.success && data?.data ? (data.data as unknown as Product) : null;

  return {
    product,
    loading: isLoading,
    error: error ? new Error(error.message) : null,
  };
}
