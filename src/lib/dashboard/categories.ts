/**
 * Dashboard product categories config
 * Maps to Category handles in the database (used by GET /api/products?localCollection=...)
 */

export interface DashboardCategory {
  label: string;
  collectionHandle: string;
}

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  { label: 'Light Beer', collectionHandle: 'light-beer' },
  { label: 'Craft Beer', collectionHandle: 'craft-beer' },
  { label: 'Seltzers & RTDs', collectionHandle: 'seltzers-rtds' },
  { label: 'Red Wine', collectionHandle: 'red-wine' },
  { label: 'White Wine', collectionHandle: 'white-wine' },
  { label: 'Sparkling', collectionHandle: 'sparkling-wine' },
  { label: 'Spirits', collectionHandle: 'spirits' },
  { label: 'Cocktail Kits', collectionHandle: 'cocktail-kits' },
  { label: 'Mixers', collectionHandle: 'mixers' },
  { label: 'Party Supplies', collectionHandle: 'weekend-party-supplies' },
  { label: 'Kegs', collectionHandle: 'kegs' },
];
