/**
 * @fileoverview Configuration for products that should be noindexed from search engines
 * @module lib/noindex-products
 *
 * This file manages products that should remain purchasable but hidden from Google
 * search results. Used to address SEO issues from Google algorithm updates.
 *
 * Products are matched by their URL handle (the /products/[handle] part of the URL).
 * Matching is case-insensitive and supports both exact matches and partial matches.
 */

/**
 * Array of product handles that should have noindex meta tags.
 * These products will still be accessible and purchasable, but will not appear
 * in Google search results.
 *
 * Categories of noindex products:
 * - Tobacco/Snuff products (not core to alcohol delivery business)
 * - Nicotine products
 * - Other off-brand items that dilute SEO focus
 */
export const NOINDEX_PRODUCT_HANDLES: string[] = [
  // Schneeberg/Poschl tobacco-free snuff products
  // These match any handle containing these substrings
  'schneeberg',
  'poschl',
  'pöschl',
  'weiss',

  // Generic tobacco/snuff handles (for future products)
  'snuff',
  'tobacco',
  'nicotine',
  'cigar',
  'cigarette',
  'vape',
];

/**
 * Patterns that indicate a product should be noindexed.
 * Used for partial matching against product handles.
 */
export const NOINDEX_HANDLE_PATTERNS: string[] = [
  'schneeberg',
  'poschl',
  'pöschl',
  'weiss',
  'snuff',
  'tobacco',
  'nicotine',
];

/**
 * Determines if a product should have noindex meta tags based on its handle.
 *
 * Products matching these criteria will:
 * - Still be accessible at their URL
 * - Still be purchasable by customers
 * - NOT appear in Google search results
 * - Have robots meta tag set to { index: false, follow: true }
 *
 * @param handle - The product URL handle (e.g., 'schneeberg-weiss-snuff')
 * @returns true if the product should be noindexed, false otherwise
 *
 * @example
 * ```typescript
 * shouldNoindexProduct('schneeberg-weiss-snuff'); // returns true
 * shouldNoindexProduct('deep-eddy-vodka'); // returns false
 * shouldNoindexProduct('poschl-snuff-tin'); // returns true
 * ```
 */
export function shouldNoindexProduct(handle: string): boolean {
  if (!handle) return false;

  const normalizedHandle = handle.toLowerCase();

  // Check if handle contains any noindex patterns
  return NOINDEX_HANDLE_PATTERNS.some(pattern =>
    normalizedHandle.includes(pattern.toLowerCase())
  );
}

/**
 * Gets the robots meta configuration for a product.
 *
 * @param handle - The product URL handle
 * @returns Robots meta configuration object for Next.js metadata
 *
 * @example
 * ```typescript
 * const robots = getProductRobotsMeta('schneeberg-snuff');
 * // Returns: { index: false, follow: true }
 *
 * const robots = getProductRobotsMeta('titos-vodka');
 * // Returns: { index: true, follow: true }
 * ```
 */
export function getProductRobotsMeta(handle: string): { index: boolean; follow: boolean } {
  const shouldNoindex = shouldNoindexProduct(handle);

  return {
    index: !shouldNoindex,
    follow: true, // Always allow following links even on noindex pages
  };
}
