// Client
export { shopifyClient, shopifyFetch } from './client';

// Types
export * from './types';

// Queries
export * from './queries/products';
export * from './queries/customer';

// Mutations
export * from './mutations/cart';
export * from './mutations/customer';

// Utils
export * from './utils';

// Hooks
export { useCart } from './hooks/useCart';
export { useCustomer } from './hooks/useCustomer';