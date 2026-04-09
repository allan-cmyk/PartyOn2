/**
 * Per-affiliate product exclusions for the order dashboard.
 *
 * When a customer arrives via an affiliate referral, we may want to hide
 * specific products from their browse/search/recommendations -- typically
 * because the affiliate sells that item themselves and doesn't want us
 * competing on it (e.g. Centex Boat Rentals sells ice on the boat).
 *
 * Keys are affiliate codes (uppercase). Values are product UUIDs to hide.
 */
export const AFFILIATE_HIDDEN_PRODUCTS: Record<string, string[]> = {
  // Centex Boat Rentals provides ice directly to their customers
  CENTEXBOATRENTALS: [
    '752f887e-d7e1-41ef-bd27-eb7e0e04d526', // Bag of Ice * 20lbs
  ],
};

/**
 * Returns the list of product IDs that should be hidden for the given
 * affiliate code, or an empty array if there are no exclusions.
 */
export function getHiddenProductIds(affiliateCode?: string | null): string[] {
  if (!affiliateCode) return [];
  return AFFILIATE_HIDDEN_PRODUCTS[affiliateCode.toUpperCase()] ?? [];
}
