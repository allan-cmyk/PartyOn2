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

// Add simple cache for collection data
const collectionCache = new Map<string, {
  products: ShopifyProduct[],
  timestamp: number,
  ttl: number
}>();

// Preload popular collections (bachelor-favorites first since it's the default)
const POPULAR_COLLECTIONS = ['bachelor-favorites', 'seltzer-collection', 'bachelorette-booze', 'champagne', 'spirits'];

// Preload function to warm cache
async function preloadCollection(handle: string) {
  try {
    const data = await shopifyFetch<CollectionProductsResponse>({
      query: COLLECTION_BY_HANDLE_QUERY,
      variables: { handle, first: 100 },
    });

    if (data.collectionByHandle) {
      const products = data.collectionByHandle.products.edges.map(edge => edge.node);
      collectionCache.set(handle, {
        products,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minutes
      });
      console.log(`Preloaded collection: ${handle} (${products.length} products)`);
    }
  } catch (err) {
    console.warn(`Failed to preload collection ${handle}:`, err);
  }
}

// Initialize preloading on module load (only in browser)
if (typeof window !== 'undefined') {
  // Delay preloading to not block initial page load
  setTimeout(() => {
    POPULAR_COLLECTIONS.forEach(handle => {
      if (!collectionCache.has(handle)) {
        preloadCollection(handle);
      }
    });
  }, 2000); // Wait 2 seconds after page load
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

      // Check cache first (5 minute TTL)
      const cached = collectionCache.get(handle);
      const now = Date.now();
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        console.log(`Using cached data for collection: ${handle}`);
        setProducts(cached.products);
        setHasNextPage(false);
        setEndCursor(null);
        setLoading(false);
        return;
      }

      console.log(`Fetching fresh data for collection: ${handle}`);
      const data = await shopifyFetch<CollectionProductsResponse>({
        query: COLLECTION_BY_HANDLE_QUERY,
        variables: { handle, first: 100 }, // Get more products for collections
      });

      if (!data.collectionByHandle) {
        throw new Error(`Collection ${handle} not found`);
      }

      const newProducts = data.collectionByHandle.products.edges.map(edge => edge.node);

      // Cache the results
      collectionCache.set(handle, {
        products: newProducts,
        timestamp: now,
        ttl: CACHE_TTL
      });

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