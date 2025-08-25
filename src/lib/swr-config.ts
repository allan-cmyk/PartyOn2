import { SWRConfig } from 'swr';

export const swrConfig = {
  // Global error retry
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Revalidation settings
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  
  // Cache settings
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  
  // Loading states
  loadingTimeout: 3000,
  
  // Fetcher configuration
  fetcher: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch');
    }
    return res.json();
  },
  
  // On error handler
  onError: (error: Error, key: string) => {
    if (error.message === 'Failed to fetch') {
      console.error(`Error fetching ${key}:`, error);
    }
  },
  
  // Success handler
  onSuccess: (data: any, key: string) => {
    // Could add analytics or logging here
  },
  
  // Compare function for deep comparison
  compare: (a: any, b: any) => {
    return JSON.stringify(a) === JSON.stringify(b);
  },
};

// Create a provider component
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}