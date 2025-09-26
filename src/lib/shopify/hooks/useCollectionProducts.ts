import { useState, useEffect } from 'react';
import { shopifyFetch } from '../client';
import { COLLECTION_BY_HANDLE_QUERY, PRODUCTS_QUERY } from '../queries/products';
import { ShopifyProduct } from '../types';

interface CollectionProductsResponse {
  collectionByHandle: {
    id: string;
    handle: string;
    title: string;
    description: string;
    products: {
      edges: Array<{
        node: ShopifyProduct;
      }>;
      pageInfo?: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

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

export function useCollectionProducts(collectionHandle: string | null, initialLoadCount: number = 50) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    if (collectionHandle) {
      fetchCollectionProducts(collectionHandle);
    } else {
      fetchAllProducts();
    }
  }, [collectionHandle]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCollectionProducts = async (handle: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await shopifyFetch<CollectionProductsResponse>({
        query: COLLECTION_BY_HANDLE_QUERY,
        variables: { handle, first: 100 }, // Get more products for collections
      });

      if (!data.collectionByHandle) {
        throw new Error(`Collection ${handle} not found`);
      }

      const newProducts = data.collectionByHandle.products.edges.map(edge => edge.node);
      setProducts(newProducts);

      // Collection queries don't have pagination in our current setup
      setHasNextPage(false);
      setEndCursor(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to fetch collection ${handle}:`, err);
      // Fall back to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async (after?: string) => {
    try {
      if (!after) {
        setLoading(true);
        setError(null);
      }

      const data = await shopifyFetch<ProductsResponse>({
        query: PRODUCTS_QUERY,
        variables: { first: initialLoadCount, after },
      });

      const newProducts = data.products.edges.map(edge => edge.node);

      if (after) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setHasNextPage(data.products.pageInfo.hasNextPage);
      setEndCursor(data.products.pageInfo.endCursor);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    // Only load more for "all products" view
    if (!collectionHandle && hasNextPage && endCursor) {
      fetchAllProducts(endCursor);
    }
  };

  return {
    products,
    loading,
    error,
    hasNextPage: !collectionHandle ? hasNextPage : false,
    loadMore
  };
}