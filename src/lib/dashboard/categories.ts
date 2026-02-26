/**
 * Dashboard product categories config
 * Maps to Category handles in the database (used by GET /api/products?localCollection=...)
 * Per-party-type collections control which categories appear for each order type
 */

import type { PartyType } from '@/lib/group-orders-v2/types';

export interface DashboardCategory {
  label: string;
  collectionHandle: string;
}

/** All available categories */
const ALL: Record<string, DashboardCategory> = {
  boatEssentials:    { label: 'Boat Essentials', collectionHandle: 'boat-essentials' },
  bacheloretteFavs:  { label: 'Bachelorette Favorites', collectionHandle: 'bachelorette-booze' },
  bachelorFavs:      { label: 'Bachelor Favorites', collectionHandle: 'bachelor-favorites' },
  seltzers:          { label: 'Seltzers & RTDs', collectionHandle: 'seltzers-rtds' },
  lightBeer:         { label: 'Light Beer', collectionHandle: 'light-beer' },
  craftBeer:         { label: 'Craft Beer', collectionHandle: 'craft-beer' },
  cocktailKits:      { label: 'Cocktail Kits', collectionHandle: 'cocktail-kits' },
  spirits:           { label: 'Spirits', collectionHandle: 'spirits' },
  tequila:           { label: 'Tequila', collectionHandle: 'spirits-tequila' },
  vodka:             { label: 'Vodka', collectionHandle: 'spirits-vodka' },
  whiskey:           { label: 'Whiskey & Bourbon', collectionHandle: 'spirits-whiskey' },
  rum:               { label: 'Rum', collectionHandle: 'spirits-rum' },
  gin:               { label: 'Gin', collectionHandle: 'spirits-gin' },
  liqueurs:          { label: 'Liqueurs', collectionHandle: 'spirits-liqueurs' },
  sparkling:         { label: 'Sparkling & Rose', collectionHandle: 'sparkling-wine' },
  whiteWine:         { label: 'White Wine', collectionHandle: 'white-wine' },
  redWine:           { label: 'Red Wine', collectionHandle: 'red-wine' },
  mixers:            { label: 'Mixers and N/A', collectionHandle: 'mixers' },
  kegs:              { label: 'Kegs & Equipment', collectionHandle: 'kegs' },
  partySupplies:     { label: 'Party Supplies', collectionHandle: 'weekend-party-supplies' },
  eventSupplies:     { label: 'Event Supplies', collectionHandle: 'formal-event-supplies' },
  chillSupplies:     { label: 'Chill Supplies', collectionHandle: 'chill-supplies' },
  rentals:           { label: 'Rentals', collectionHandle: 'rentals' },
};

const BOAT: DashboardCategory[] = [
  ALL.boatEssentials,
  ALL.seltzers,
  ALL.lightBeer,
  ALL.cocktailKits,
  ALL.spirits,
  ALL.craftBeer,
  ALL.sparkling,
  ALL.whiteWine,
  ALL.mixers,
  ALL.partySupplies,
];

const BACH: DashboardCategory[] = [
  ALL.bacheloretteFavs,
  ALL.bachelorFavs,
  ALL.seltzers,
  ALL.lightBeer,
  ALL.cocktailKits,
  ALL.craftBeer,
  ALL.spirits,
  ALL.sparkling,
  ALL.whiteWine,
  ALL.redWine,
  ALL.mixers,
  ALL.partySupplies,
  ALL.chillSupplies,
];

const HOUSE_PARTY: DashboardCategory[] = [
  ALL.seltzers,
  ALL.lightBeer,
  ALL.craftBeer,
  ALL.cocktailKits,
  ALL.sparkling,
  ALL.whiteWine,
  ALL.redWine,
  ALL.tequila,
  ALL.vodka,
  ALL.whiskey,
  ALL.rum,
  ALL.gin,
  ALL.liqueurs,
  ALL.mixers,
  ALL.kegs,
  ALL.partySupplies,
  ALL.chillSupplies,
  ALL.rentals,
];

const CORPORATE: DashboardCategory[] = [
  ALL.lightBeer,
  ALL.craftBeer,
  ALL.redWine,
  ALL.whiteWine,
  ALL.sparkling,
  ALL.seltzers,
  ALL.eventSupplies,
  ALL.mixers,
  ALL.tequila,
  ALL.vodka,
  ALL.whiskey,
  ALL.rum,
  ALL.gin,
  ALL.liqueurs,
  ALL.kegs,
];

const WEDDING: DashboardCategory[] = [...CORPORATE];

const OTHER: DashboardCategory[] = [...HOUSE_PARTY];

/** Map of party type to ordered collection list */
export const PARTY_TYPE_CATEGORIES: Record<PartyType, DashboardCategory[]> = {
  BOAT,
  BACH,
  BACHELOR: BACH,
  BACHELORETTE: BACH,
  HOUSE_PARTY,
  CORPORATE,
  WEDDING,
  OTHER,
};

/** Default categories when no party type is set (same as OTHER/HOUSE_PARTY) */
export const DASHBOARD_CATEGORIES: DashboardCategory[] = OTHER;

/** Get categories for a given party type, falling back to default */
export function getCategoriesForPartyType(partyType: string | null | undefined): DashboardCategory[] {
  if (partyType && partyType in PARTY_TYPE_CATEGORIES) {
    return PARTY_TYPE_CATEGORIES[partyType as PartyType];
  }
  return DASHBOARD_CATEGORIES;
}
