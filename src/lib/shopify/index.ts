// Client (still needed for direct Shopify API calls)
export { shopifyClient, shopifyFetch } from './client';

// Types (re-exported from @/lib/types for backward compatibility)
export * from './types';

// Queries (still needed for direct Shopify API calls)
export * from './queries/products';

// Mutations (still needed for direct Shopify API calls)
export * from './mutations/cart';

// Utils (re-exported from @/lib/utils for backward compatibility)
export * from './utils';
