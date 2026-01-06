/**
 * Wedding Packages Module
 * Exports all types, configurations, and utilities for the wedding order calculator
 */

// Types
export * from './types';

// Configuration
export {
  TIER_CONFIGS,
  TIER_ORDER,
  WINE_PRODUCTS,
  BEER_PRODUCTS,
  SPIRIT_PRODUCTS,
  CHAMPAGNE_PRODUCTS,
  CHAMPAGNE_PRODUCT, // @deprecated - use getChampagneForTier
  ALL_SPIRIT_TYPES,
  DEFAULT_SPIRITS,
  getTierConfig,
  getWinesForTier,
  getBeersForTier,
  getSpiritsForTier,
  getChampagneForTier,
} from './tier-config';

// Calculations
export {
  calculateWeddingPackage,
  getEstimatedTotal,
  validateSpiritSelection,
  tierRequiresSpiritPicker,
} from './calculations';

// Product Resolution
export {
  resolveProducts,
  getVariantId,
  resolveCartItems,
  enrichCalculatedItems,
  clearProductCache,
} from './product-resolver';
