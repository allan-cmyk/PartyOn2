/**
 * In-store pickup — the single owner of the pickup predicate and the store address.
 *
 * Every server-side money decision that asks "is this order in-store pickup?"
 * must go through isPickupAddress() so writers (cart/tab fee calculation) and
 * chargers (Stripe session builders, checkout routes, delivery-invoice) can
 * never disagree about what counts as pickup. Before this helper existed the
 * check was hand-rolled at 9 call sites with two different truthiness rules,
 * which is exactly how a pickup tab ended up priced from the store's own zip
 * (78752 → $25 Central Austin) and charged at checkout.
 */

/** In-store pickup location — 7600 N. Lamar Blvd #A2, Austin TX 78752 */
export const STORE_PICKUP_ADDRESS = {
  address1: '7600 N. Lamar Blvd',
  address2: '#A2',
  city: 'Austin',
  province: 'TX',
  zip: '78752',
  country: 'US',
} as const;

/**
 * True when a delivery-address value is marked as in-store pickup.
 *
 * Accepts `unknown` because the address may be a Prisma JSON column, a typed
 * DeliveryAddressV2, or a raw client payload. Deliberately STRICT
 * (`isPickup === true`, booleans only): a string "true" or a 1 does NOT count,
 * so a malformed writer can never silently waive a real delivery fee — the
 * safety failure mode is "charged when it shouldn't be", which is visible,
 * rather than "waived when it shouldn't be", which is not.
 */
export function isPickupAddress(address: unknown): boolean {
  return (
    !!address &&
    typeof address === 'object' &&
    !Array.isArray(address) &&
    (address as { isPickup?: unknown }).isPickup === true
  );
}
