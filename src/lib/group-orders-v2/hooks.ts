/**
 * Group Orders V2 - SWR Hooks
 * Real-time polling for group order state
 */

'use client';

import useSWR from 'swr';
import type { GroupOrderV2Full } from './types';

const POLL_INTERVAL = 5000; // 5 seconds

const fetcher = async (url: string): Promise<GroupOrderV2Full> => {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to fetch');
  }
  return json.data;
};

/**
 * Hook to fetch and poll a group order by share code
 */
export function useGroupOrderV2(code: string | null) {
  const { data, error, isLoading, mutate } = useSWR<GroupOrderV2Full>(
    code ? `/api/v2/group-orders/${code}` : null,
    fetcher,
    {
      refreshInterval: POLL_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    groupOrder: data ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

/**
 * Hook to fetch user's group orders (no polling)
 */
export function useMyGroupOrdersV2(customerId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<GroupOrderV2Full[]>(
    customerId ? `/api/v2/group-orders/my-orders?customerId=${customerId}` : null,
    async (url: string) => {
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Failed to fetch');
      return json.data;
    },
    {
      revalidateOnFocus: true,
    }
  );

  return {
    groupOrders: data ?? [],
    error,
    isLoading,
    refresh: () => mutate(),
  };
}
