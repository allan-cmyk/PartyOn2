/**
 * Feature Flags Service
 * Note: FeatureFlag model not in Prisma schema - all flags disabled by default
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Feature flag keys
 */
export const FEATURE_FLAGS = {
  // Cart system
  USE_CUSTOM_CART: 'use_custom_cart',
  USE_CUSTOM_CHECKOUT: 'use_custom_checkout',

  // Product management
  USE_CUSTOM_PRODUCTS: 'use_custom_products',
  USE_CUSTOM_INVENTORY: 'use_custom_inventory',

  // Customer system
  USE_CUSTOM_AUTH: 'use_custom_auth',
  USE_CUSTOM_CUSTOMERS: 'use_custom_customers',

  // Orders
  USE_CUSTOM_ORDERS: 'use_custom_orders',

  // AI features
  AI_INVENTORY_COUNTING: 'ai_inventory_counting',
  AI_STOCK_PREDICTIONS: 'ai_stock_predictions',
  AI_QUERY_ASSISTANT: 'ai_query_assistant',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/**
 * Get a feature flag's state (stub - always returns false)
 */
export async function isFeatureEnabled(
  _key: FeatureFlagKey,
  _userId?: string
): Promise<boolean> {
  // All feature flags disabled - using Shopify for all features
  return false;
}

/**
 * Enable a feature flag (no-op)
 */
export async function enableFeature(
  _key: FeatureFlagKey,
  _rolloutPercentage = 100
): Promise<void> {
  // No-op - feature flags not implemented
}

/**
 * Disable a feature flag (no-op)
 */
export async function disableFeature(_key: FeatureFlagKey): Promise<void> {
  // No-op - feature flags not implemented
}

/**
 * Set rollout percentage (no-op)
 */
export async function setRolloutPercentage(
  _key: FeatureFlagKey,
  _percentage: number
): Promise<void> {
  // No-op - feature flags not implemented
}

/**
 * Get all feature flags status (stub)
 */
export async function getAllFeatureFlags(): Promise<
  Array<{
    key: string;
    enabled: boolean;
    rolloutPercentage: number;
  }>
> {
  // Return all flags as disabled
  return Object.values(FEATURE_FLAGS).map((key) => ({
    key,
    enabled: false,
    rolloutPercentage: 0,
  }));
}

/**
 * Clear all cached flags (no-op)
 */
export function clearFlagCache(): void {
  // No-op - no cache
}
