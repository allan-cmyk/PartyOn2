/**
 * Feature Flag Service
 * Controls gradual rollout of new features
 */

import { prisma, isDatabaseConfigured } from '@/lib/database/client';

// Default flags for when database is not available
const DEFAULT_FLAGS: Record<string, { enabled: boolean; rolloutPercentage: number }> = {
  USE_CUSTOM_CART: { enabled: false, rolloutPercentage: 0 },
  USE_STRIPE_CHECKOUT: { enabled: false, rolloutPercentage: 0 },
  AI_INVENTORY_COUNTING: { enabled: false, rolloutPercentage: 0 },
  USE_CUSTOM_PRODUCTS: { enabled: false, rolloutPercentage: 0 },
};

// Cache for feature flags (refreshed every 5 minutes)
let flagCache: Record<string, { enabled: boolean; rolloutPercentage: number }> | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load flags from database or use defaults
 */
async function loadFlags(): Promise<Record<string, { enabled: boolean; rolloutPercentage: number }>> {
  const now = Date.now();

  // Return cached flags if still valid
  if (flagCache && now - lastCacheTime < CACHE_TTL) {
    return flagCache;
  }

  // If database not configured, return defaults
  if (!isDatabaseConfigured()) {
    return DEFAULT_FLAGS;
  }

  try {
    const flags = await prisma.featureFlag.findMany();

    const flagMap: Record<string, { enabled: boolean; rolloutPercentage: number }> = {};
    for (const flag of flags) {
      flagMap[flag.key] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
      };
    }

    // Merge with defaults for any missing flags
    flagCache = { ...DEFAULT_FLAGS, ...flagMap };
    lastCacheTime = now;

    return flagCache;
  } catch (error) {
    console.error('[Feature Flags] Failed to load from database:', error);
    return DEFAULT_FLAGS;
  }
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await loadFlags();
  return flags[key]?.enabled ?? false;
}

/**
 * Check if a feature is enabled for a specific user (based on rollout percentage)
 */
export async function isFeatureEnabledForUser(key: string, userId: string): Promise<boolean> {
  const flags = await loadFlags();
  const flag = flags[key];

  if (!flag) return false;
  if (!flag.enabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (flag.rolloutPercentage <= 0) return false;

  // Deterministic hash based on user ID and feature key
  const hash = simpleHash(`${userId}:${key}`);
  const userPercentile = hash % 100;

  return userPercentile < flag.rolloutPercentage;
}

/**
 * Get all feature flags
 */
export async function getAllFlags(): Promise<Record<string, { enabled: boolean; rolloutPercentage: number }>> {
  return loadFlags();
}

/**
 * Set feature flag (for admin use)
 */
export async function setFeatureFlag(
  key: string,
  enabled: boolean,
  rolloutPercentage?: number
): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error('Database not configured');
  }

  await prisma.featureFlag.upsert({
    where: { key },
    update: {
      enabled,
      rolloutPercentage: rolloutPercentage ?? (enabled ? 100 : 0),
    },
    create: {
      key,
      enabled,
      rolloutPercentage: rolloutPercentage ?? (enabled ? 100 : 0),
      description: `Feature flag: ${key}`,
    },
  });

  // Invalidate cache
  flagCache = null;
}

/**
 * Simple hash function for deterministic user bucketing
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
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
