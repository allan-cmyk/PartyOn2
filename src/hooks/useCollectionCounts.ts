/**
 * SWR hook for fetching product counts per collection in batch
 */

import useSWR from 'swr';

interface CountsResponse {
  counts: Record<string, number>;
}

const fetcher = async (url: string): Promise<CountsResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch counts');
  return res.json();
};

export function useCollectionCounts(handles: string[]): {
  counts: Record<string, number>;
  loading: boolean;
} {
  const key = handles.length > 0
    ? `/api/products/counts?handles=${handles.join(',')}`
    : null;

  const { data, isLoading } = useSWR<CountsResponse>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  return {
    counts: data?.counts ?? {},
    loading: isLoading,
  };
}
