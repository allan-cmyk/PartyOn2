/**
 * Group Orders V2 - Order Type Configuration
 * Maps order types to Shopify collection handles for product filtering
 */

export const ORDER_TYPES = [
  { value: 'boat', label: 'Boat Party', icon: 'boat', collections: ['boat-party'] },
  { value: 'house', label: 'House Party', icon: 'house', collections: ['house-party'] },
  { value: 'bus', label: 'Bus Party', icon: 'bus', collections: ['bus-party'] },
  { value: 'other', label: 'Other', icon: 'party', collections: [] },
] as const;

export type OrderTypeValue = (typeof ORDER_TYPES)[number]['value'];

export const ORDER_TYPE_VALUES = ORDER_TYPES.map((t) => t.value);

/**
 * Get Shopify collection handles for a given order type.
 * Returns empty array for 'other' or unknown types (meaning no filter / show all).
 */
export function getCollectionsForOrderType(orderType: string | null | undefined): string[] {
  if (!orderType) return [];
  const found = ORDER_TYPES.find((t) => t.value === orderType);
  return found ? [...found.collections] : [];
}
