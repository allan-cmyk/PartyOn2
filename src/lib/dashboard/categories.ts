/**
 * Dashboard product categories config
 * Maps to existing localCollection handles used by GET /api/products
 */

export interface DashboardCategory {
  label: string;
  collectionHandle: string;
}

export const DASHBOARD_CATEGORIES: DashboardCategory[] = [
  { label: 'Beer', collectionHandle: 'tailgate-beer' },
  { label: 'Seltzers', collectionHandle: 'seltzer-collection' },
  { label: 'Cocktail Kits', collectionHandle: 'cocktail-kits' },
  { label: 'Wine & Champagne', collectionHandle: 'champagne' },
  { label: 'Spirits', collectionHandle: 'spirits' },
  { label: 'Mixers & Non-Alcoholic', collectionHandle: 'mixers-non-alcoholic' },
  { label: 'Party Supplies', collectionHandle: 'all-party-supplies' },
];
