import { useState, useEffect } from 'react';
import { shopifyFetch } from '../client';
import { COLLECTIONS_QUERY } from '../queries/products';
import { ShopifyCollection } from '../types';

interface UseCollectionsResult {
  collections: ShopifyCollection[];
  loading: boolean;
  error: Error | null;
}

export function useCollections(): UseCollectionsResult {
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await shopifyFetch<{
          collections: {
            edges: Array<{ node: ShopifyCollection }>;
          };
        }>({
          query: COLLECTIONS_QUERY,
          variables: { first: 50 }
        });

        setCollections(response.collections.edges.map(edge => edge.node));
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return { collections, loading, error };
}