/**
 * Group Orders V2 - Order Type Configuration
 * Maps order types to Shopify collection handles for product filtering
 */

export interface OrderCollection {
  handle: string;
  label: string;
}

export const ORDER_TYPES = [
  { value: 'house', label: 'House', icon: 'house', collections: [{ handle: 'house-party', label: 'All' }] },
  { value: 'boat', label: 'Boat Party', icon: 'boat', collections: [{ handle: 'boat-beers', label: 'Beer' }] },
  { value: 'bus', label: 'Bus Party', icon: 'bus', collections: [{ handle: 'bus-party', label: 'All' }] },
  { value: 'other', label: 'Other', icon: 'party', collections: [] as OrderCollection[] },
] as const;

export type OrderTypeValue = (typeof ORDER_TYPES)[number]['value'];

export const ORDER_TYPE_VALUES = ORDER_TYPES.map((t) => t.value);

/**
 * Get Shopify collection objects for a given order type.
 * Returns empty array for 'other' or unknown types (meaning no filter / show all).
 */
export function getCollectionsForOrderType(orderType: string | null | undefined): OrderCollection[] {
  if (!orderType) return [];
  const found = ORDER_TYPES.find((t) => t.value === orderType);
  return found ? [...found.collections] : [];
}
