/**
 * Feature Flag Service
 * Note: FeatureFlag model not in Prisma schema - all flags disabled by default
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// Default flags - all disabled
const DEFAULT_FLAGS: Record<string, { enabled: boolean; rolloutPercentage: number }> = {
  USE_CUSTOM_CART: { enabled: false, rolloutPercentage: 0 },
  USE_STRIPE_CHECKOUT: { enabled: false, rolloutPercentage: 0 },
  AI_INVENTORY_COUNTING: { enabled: false, rolloutPercentage: 0 },
  USE_CUSTOM_PRODUCTS: { enabled: false, rolloutPercentage: 0 },
};

/**
 * Check if a feature is enabled (stub - always returns false)
 */
export async function isFeatureEnabled(_key: string): Promise<boolean> {
  return false;
}

/**
 * Check if a feature is enabled for a specific user (stub - always returns false)
 */
export async function isFeatureEnabledForUser(_key: string, _userId: string): Promise<boolean> {
  return false;
}

/**
 * Get all feature flags (stub - returns defaults as disabled)
 */
export async function getAllFlags(): Promise<Record<string, { enabled: boolean; rolloutPercentage: number }>> {
  return DEFAULT_FLAGS;
}

/**
 * Set feature flag (stub - no-op)
 */
export async function setFeatureFlag(
  _key: string,
  _enabled: boolean,
  _rolloutPercentage?: number
): Promise<void> {
  // No-op - feature flags not implemented
}

/**
 * Feature flag keys enum for type safety
 */
export const FEATURE_FLAGS = {
  USE_CUSTOM_CART: 'USE_CUSTOM_CART',
  USE_STRIPE_CHECKOUT: 'USE_STRIPE_CHECKOUT',
  AI_INVENTORY_COUNTING: 'AI_INVENTORY_COUNTING',
  USE_CUSTOM_PRODUCTS: 'USE_CUSTOM_PRODUCTS',
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];
