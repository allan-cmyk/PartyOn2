/**
 * Group Orders V2 - Order Type Configuration
 * Maps order types to Shopify collection handles for product filtering
 */

export interface CollectionColors {
  bg: string;
  bgActive: string;
  text: string;
  textActive: string;
  border: string;
  borderActive: string;
}

export interface OrderCollection {
  handle: string;
  label: string;
  colors: CollectionColors;
}

// Common collections available across all order types with color schemes
const COMMON_COLLECTIONS: OrderCollection[] = [
  {
    handle: 'favorites-home-page',
    label: 'Favorites',
    colors: {
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      bgActive: 'bg-brand-yellow',
      text: 'text-gray-900',
      textActive: 'text-gray-900',
      border: 'border-brand-yellow hover:border-yellow-500',
      borderActive: 'border-brand-yellow',
    },
  },
  {
    handle: 'light-beer',
    label: 'Light Beer',
    colors: {
      bg: 'bg-amber-50 hover:bg-amber-100',
      bgActive: 'bg-amber-600',
      text: 'text-gray-900',
      textActive: 'text-gray-900',
      border: 'border-amber-400 hover:border-amber-500',
      borderActive: 'border-amber-600',
    },
  },
  {
    handle: 'craft-beer',
    label: 'Craft Beer',
    colors: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      bgActive: 'bg-orange-600',
      text: 'text-gray-900',
      textActive: 'text-gray-900',
      border: 'border-orange-400 hover:border-orange-500',
      borderActive: 'border-orange-600',
    },
  },
  {
    handle: 'seltzers-rtds',
    label: 'Seltzers & RTDs',
    colors: {
      bg: 'bg-cyan-50 hover:bg-cyan-100',
      bgActive: 'bg-cyan-600',
      text: 'text-gray-900',
      textActive: 'text-white',
      border: 'border-cyan-400 hover:border-cyan-500',
      borderActive: 'border-cyan-600',
    },
  },
  {
    handle: 'spirits',
    label: 'Spirits',
    colors: {
      bg: 'bg-slate-50 hover:bg-slate-100',
      bgActive: 'bg-slate-700',
      text: 'text-gray-900',
      textActive: 'text-white',
      border: 'border-slate-400 hover:border-slate-500',
      borderActive: 'border-slate-700',
    },
  },
  {
    handle: 'sparkling-wine',
    label: 'Wine',
    colors: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      bgActive: 'bg-purple-600',
      text: 'text-gray-900',
      textActive: 'text-white',
      border: 'border-purple-400 hover:border-purple-500',
      borderActive: 'border-purple-600',
    },
  },
  {
    handle: 'cocktail-kits',
    label: 'Cocktail Kits',
    colors: {
      bg: 'bg-rose-50 hover:bg-rose-100',
      bgActive: 'bg-rose-600',
      text: 'text-gray-900',
      textActive: 'text-white',
      border: 'border-rose-400 hover:border-rose-500',
      borderActive: 'border-rose-600',
    },
  },
];

export const ORDER_TYPES = [
  { value: 'house', label: 'House', icon: 'house', collections: COMMON_COLLECTIONS },
  { value: 'boat', label: 'Boat Party', icon: 'boat', collections: COMMON_COLLECTIONS },
  { value: 'bus', label: 'Bus Party', icon: 'bus', collections: COMMON_COLLECTIONS },
  { value: 'other', label: 'Other', icon: 'party', collections: COMMON_COLLECTIONS },
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
