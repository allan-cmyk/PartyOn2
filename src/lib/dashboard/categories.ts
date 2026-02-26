/**
 * Dashboard product categories config
 * Maps to Category handles in the database (used by GET /api/products?localCollection=...)
 * Ordered by sales priority (best-selling categories first)
 */

export interface DashboardCategory {
  label: string;
  collectionHandle: string;
}

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  { label: 'Seltzers & RTDs', collectionHandle: 'seltzers-rtds' },
  { label: 'Light Beer', collectionHandle: 'light-beer' },
  { label: 'Craft Beer', collectionHandle: 'craft-beer' },
  { label: 'Tequila', collectionHandle: 'spirits-tequila' },
  { label: 'Vodka', collectionHandle: 'spirits-vodka' },
  { label: 'Whiskey & Bourbon', collectionHandle: 'spirits-whiskey' },
  { label: 'Rum', collectionHandle: 'spirits-rum' },
  { label: 'Gin', collectionHandle: 'spirits-gin' },
  { label: 'Liqueurs', collectionHandle: 'spirits-liqueurs' },
  { label: 'Sparkling & Rose', collectionHandle: 'sparkling-wine' },
  { label: 'White Wine', collectionHandle: 'white-wine' },
  { label: 'Red Wine', collectionHandle: 'red-wine' },
  { label: 'Mixers and N/A', collectionHandle: 'mixers' },
  { label: 'Cocktail Kits', collectionHandle: 'cocktail-kits' },
  { label: 'Kegs & Equipment', collectionHandle: 'kegs' },
  { label: 'Party Supplies', collectionHandle: 'weekend-party-supplies' },
  { label: 'Chill Supplies', collectionHandle: 'chill-supplies' },
  { label: 'Food', collectionHandle: 'food' },
  { label: 'Rentals', collectionHandle: 'rentals' },
];
