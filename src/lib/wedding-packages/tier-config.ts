/**
 * Wedding Package Tier Configuration
 * Maps each tier to specific products from Shopify inventory
 */

import type {
  WeddingTier,
  TierConfig,
  WeddingProduct,
  SpiritType,
  WineLevel,
  SpiritLevel,
} from './types';

// ============================================================================
// TIER CONFIGURATIONS
// ============================================================================

export const TIER_CONFIGS: Record<WeddingTier, TierConfig> = {
  'beer-wine-special': {
    id: 'beer-wine-special',
    name: 'Beer & Wine Special',
    pricePerPerson: 13,
    description: 'Perfect for casual celebrations',
    features: [
      '4 House Wines',
      'Champagne Toast',
      '2 Domestic Beers',
      '3 Craft Beers',
    ],
    wines: { house: 4, standard: 0, deluxe: 0 },
    beer: { domestic: 2, craft: 3 },
    spirits: { level: null, pickCount: 0 },
    includesChampagne: true,
  },
  'affordable-full-bar': {
    id: 'affordable-full-bar',
    name: 'Affordable Full Bar',
    pricePerPerson: 16,
    description: 'Great value with full bar options',
    features: [
      '4 House Wines',
      'Champagne Toast',
      '2 Domestic Beers',
      '3 Craft Beers',
      'House Spirits (Pick 3)',
    ],
    wines: { house: 4, standard: 0, deluxe: 0 },
    beer: { domestic: 2, craft: 3 },
    spirits: { level: 'house', pickCount: 3 },
    includesChampagne: true,
  },
  'standard-bar': {
    id: 'standard-bar',
    name: 'Standard Bar',
    pricePerPerson: 20,
    description: 'Elevated selections for memorable moments',
    features: [
      '2 Standard + 2 House Wines',
      'Champagne Toast',
      '2 Domestic Beers',
      '3 Craft Beers',
      'House Spirits (Pick 3)',
    ],
    wines: { house: 2, standard: 2, deluxe: 0 },
    beer: { domestic: 2, craft: 3 },
    spirits: { level: 'house', pickCount: 3 },
    includesChampagne: true,
  },
  'texas-bar': {
    id: 'texas-bar',
    name: 'Texas Bar',
    pricePerPerson: 23,
    description: 'Showcase local Austin favorites',
    features: [
      '2 Standard + 2 House Wines',
      'Champagne Toast',
      '2 Domestic Beers',
      '4 Craft Beers',
      'Texas Spirits (Pick 3)',
    ],
    wines: { house: 2, standard: 2, deluxe: 0 },
    beer: { domestic: 2, craft: 4 },
    spirits: { level: 'texas', pickCount: 3 },
    includesChampagne: true,
  },
  'deluxe-bar': {
    id: 'deluxe-bar',
    name: 'Deluxe Bar',
    pricePerPerson: 26,
    description: 'Premium selections for luxury events',
    features: [
      '2 Deluxe + 2 Standard Wines',
      'Champagne Toast',
      '2 Domestic Beers',
      '4 Craft Beers',
      'All 5 Deluxe Spirits',
    ],
    wines: { house: 0, standard: 2, deluxe: 2 },
    beer: { domestic: 2, craft: 4 },
    spirits: { level: 'deluxe', pickCount: 'all' },
    includesChampagne: true,
  },
};

// ============================================================================
// WINE PRODUCTS BY LEVEL
// ============================================================================

export const WINE_PRODUCTS: Record<WineLevel, WeddingProduct[]> = {
  house: [
    {
      name: 'Dark Horse Pinot Grigio',
      handle: 'dark-horse-pinot-grigio-750ml-bottle',
      category: 'wine',
      subcategory: 'white',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 10.99,
    },
    {
      name: 'Chateau St. Michelle Chardonnay',
      handle: 'chateau-st-michelle-sauvignon-blanc-750ml-bottle',
      category: 'wine',
      subcategory: 'white',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 11.99,
    },
    {
      name: '14 Hands Cabernet Sauvignon',
      handle: '14-hands-cabernet-sauvignon-750ml-bottle',
      category: 'wine',
      subcategory: 'red',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 13.99,
    },
    {
      name: 'Bogle Pinot Noir',
      handle: 'bogle-pinot-noir-750ml',
      category: 'wine',
      subcategory: 'red',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 11.99,
    },
  ],
  standard: [
    {
      name: 'Jam Cellars Butter Chardonnay',
      handle: 'jam-cellars-chardonnay-butter-california-750ml-bottle',
      category: 'wine',
      subcategory: 'white',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 18.99,
    },
    {
      name: 'Meiomi Pinot Noir',
      handle: 'meiomi-pinot-noir-california-750ml-bottle',
      category: 'wine',
      subcategory: 'red',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 23.99,
    },
  ],
  deluxe: [
    {
      name: 'Chalk Hill Chardonnay',
      handle: 'chalk-hill-chardonnay-sonoma-coast-750ml',
      category: 'wine',
      subcategory: 'white',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 20.99,
    },
    {
      name: 'Decoy Cabernet Sauvignon',
      handle: 'decoy-by-duckhorn-cabernet-sauvignon-750ml-bottle',
      category: 'wine',
      subcategory: 'red',
      servingsPerUnit: 5,
      unitLabel: '750ml',
      estimatedPrice: 20.99,
    },
  ],
};

// ============================================================================
// BEER PRODUCTS BY TYPE
// ============================================================================

export const BEER_PRODUCTS: Record<'domestic' | 'craft', WeddingProduct[]> = {
  domestic: [
    {
      name: 'Miller Lite',
      handle: 'miller-lite-24-pack-12oz-can',
      category: 'beer',
      subcategory: 'domestic',
      servingsPerUnit: 24,
      unitLabel: '24-pack',
      estimatedPrice: 29.99,
    },
    {
      name: 'Coors Light',
      handle: 'coors-light-24-pack-12oz-can',
      category: 'beer',
      subcategory: 'domestic',
      servingsPerUnit: 24,
      unitLabel: '24-pack',
      estimatedPrice: 30.99,
    },
    {
      name: 'Bud Light',
      handle: 'bud-light-24-pack-12oz-can',
      category: 'beer',
      subcategory: 'domestic',
      servingsPerUnit: 24,
      unitLabel: '24-pack',
      estimatedPrice: 29.99,
    },
    {
      name: 'Modelo Especial',
      handle: 'modelo-especial-24-pack-12oz-can',
      category: 'beer',
      subcategory: 'domestic',
      servingsPerUnit: 24,
      unitLabel: '24-pack',
      estimatedPrice: 33.99,
    },
    {
      name: 'Lone Star',
      handle: 'lone-star-24-pack-12oz-can',
      category: 'beer',
      subcategory: 'domestic',
      servingsPerUnit: 24,
      unitLabel: '24-pack',
      estimatedPrice: 25.99,
    },
  ],
  craft: [
    {
      name: 'Shiner Bock',
      handle: 'shiner-bock-18-pack-12oz-can',
      category: 'beer',
      subcategory: 'craft',
      servingsPerUnit: 18,
      unitLabel: '18-pack',
      estimatedPrice: 25.99,
    },
    {
      name: 'Karbach Love Street',
      handle: 'karbach-love-street-blonde-12-pack-12oz-can',
      category: 'beer',
      subcategory: 'craft',
      servingsPerUnit: 12,
      unitLabel: '12-pack',
      estimatedPrice: 19.99,
    },
    {
      name: 'Karbach Variety Pack',
      handle: 'karbach-ranch-water-variety-pack-12-pack-12oz-can',
      category: 'beer',
      subcategory: 'craft',
      servingsPerUnit: 12,
      unitLabel: '12-pack',
      estimatedPrice: 19.99,
    },
    {
      name: 'Austin Beerworks Variety',
      handle: 'austin-beerworks-variety-pack-12-pack-12oz-can',
      category: 'beer',
      subcategory: 'craft',
      servingsPerUnit: 12,
      unitLabel: '12-pack',
      estimatedPrice: 22.99,
    },
    {
      name: 'Real Ale Sampler',
      handle: 'real-ale-sampler-12-pack-12-oz-can',
      category: 'beer',
      subcategory: 'craft',
      servingsPerUnit: 12,
      unitLabel: '12-pack',
      estimatedPrice: 18.99,
    },
  ],
};

// ============================================================================
// SPIRIT PRODUCTS BY LEVEL AND TYPE
// ============================================================================

export const SPIRIT_PRODUCTS: Record<SpiritLevel, Record<SpiritType, WeddingProduct>> = {
  house: {
    vodka: {
      name: 'Goodnight Loving Vodka',
      handle: 'goodnight-loving-vodka-750ml-bottle',
      category: 'spirits',
      subcategory: 'vodka',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 22.99,
    },
    tequila: {
      name: 'Lunazul Blanco Tequila',
      handle: 'lunazul-blanco-tequila-750ml-bottle',
      category: 'spirits',
      subcategory: 'tequila',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 25.99,
    },
    whiskey: {
      name: 'Four Roses Bourbon',
      handle: 'four-roses-bourbon-750ml-bottle',
      category: 'spirits',
      subcategory: 'whiskey',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 31.99,
    },
    gin: {
      name: 'Beefeater Gin',
      handle: 'beefeater-gin-750ml',
      category: 'spirits',
      subcategory: 'gin',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 28.99,
    },
    rum: {
      name: 'Bacardi Superior White Rum',
      handle: 'bacardi-light-rum-superior-80-750ml-bottle',
      category: 'spirits',
      subcategory: 'rum',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 18.99,
    },
  },
  texas: {
    vodka: {
      name: 'Deep Eddy Vodka',
      handle: 'deep-eddy-lemon-vodka-1-75l-bottle',
      category: 'spirits',
      subcategory: 'vodka',
      servingsPerUnit: 39,
      unitLabel: '1.75L',
      estimatedPrice: 28.99,
    },
    tequila: {
      name: 'Tequila 512 Blanco',
      handle: 'tequila-512-blanco-750ml-bottle',
      category: 'spirits',
      subcategory: 'tequila',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 39.99,
    },
    whiskey: {
      name: 'Treaty Oak Day Drinker Bourbon',
      handle: 'treaty-oak-day-drinker-bourbon-750ml-bottle',
      category: 'spirits',
      subcategory: 'whiskey',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 30.99,
    },
    gin: {
      name: 'Dripping Springs Artisan Gin',
      handle: 'dripping-springs-artisan-gin-750ml-bottle',
      category: 'spirits',
      subcategory: 'gin',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 32.99,
    },
    rum: {
      name: 'Island Getaway White Rum',
      handle: 'island-getaway-white-rum-750ml-bottle',
      category: 'spirits',
      subcategory: 'rum',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 22.99,
    },
  },
  deluxe: {
    vodka: {
      name: "Tito's Handmade Vodka",
      handle: 'titos-handmade-vodka-1-75l-bottle',
      category: 'spirits',
      subcategory: 'vodka',
      servingsPerUnit: 39,
      unitLabel: '1.75L',
      estimatedPrice: 40.99,
    },
    tequila: {
      name: 'Espolon Tequila Blanco',
      handle: 'espolon-tequila-blanco-750ml-bottle',
      category: 'spirits',
      subcategory: 'tequila',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 35.99,
    },
    whiskey: {
      name: "Maker's Mark Bourbon",
      handle: 'makers-mark-straight-bourbon-90-750ml-bottle',
      category: 'spirits',
      subcategory: 'whiskey',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 35.00,
    },
    gin: {
      name: 'Waterloo No. 9 Gin',
      handle: 'waterloo-no-9-gin-750ml-bottle',
      category: 'spirits',
      subcategory: 'gin',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 34.99,
    },
    rum: {
      name: 'Cruzan Single Barrel Rum',
      handle: 'cruzan-rum-single-barrel-rum-750ml-bottle',
      category: 'spirits',
      subcategory: 'rum',
      servingsPerUnit: 17,
      unitLabel: '750ml',
      estimatedPrice: 25.99,
    },
  },
};

// ============================================================================
// CHAMPAGNE FOR TOAST
// ============================================================================

export const CHAMPAGNE_PRODUCT: WeddingProduct = {
  name: 'La Marca Prosecco',
  handle: 'la-marca-prosecco-extra-dry-750ml-bottle',
  category: 'champagne',
  subcategory: 'sparkling',
  servingsPerUnit: 5,
  unitLabel: '750ml',
  estimatedPrice: 17.99,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get all tier IDs in display order */
export const TIER_ORDER: WeddingTier[] = [
  'beer-wine-special',
  'affordable-full-bar',
  'standard-bar',
  'texas-bar',
  'deluxe-bar',
];

/** Get tier config by ID */
export function getTierConfig(tierId: WeddingTier): TierConfig {
  return TIER_CONFIGS[tierId];
}

/** Get wines for a tier based on its configuration */
export function getWinesForTier(tier: TierConfig): WeddingProduct[] {
  const wines: WeddingProduct[] = [];

  // Add deluxe wines
  if (tier.wines.deluxe > 0) {
    wines.push(...WINE_PRODUCTS.deluxe.slice(0, tier.wines.deluxe));
  }

  // Add standard wines
  if (tier.wines.standard > 0) {
    wines.push(...WINE_PRODUCTS.standard.slice(0, tier.wines.standard));
  }

  // Add house wines
  if (tier.wines.house > 0) {
    wines.push(...WINE_PRODUCTS.house.slice(0, tier.wines.house));
  }

  return wines;
}

/** Get beers for a tier based on its configuration */
export function getBeersForTier(tier: TierConfig): WeddingProduct[] {
  const beers: WeddingProduct[] = [];

  // Add domestic beers (pick first N from list)
  if (tier.beer.domestic > 0) {
    beers.push(...BEER_PRODUCTS.domestic.slice(0, tier.beer.domestic));
  }

  // Add craft beers (pick first N from list)
  if (tier.beer.craft > 0) {
    beers.push(...BEER_PRODUCTS.craft.slice(0, tier.beer.craft));
  }

  return beers;
}

/** Get spirits for a tier based on selected spirit types */
export function getSpiritsForTier(
  tier: TierConfig,
  selectedSpirits: SpiritType[]
): WeddingProduct[] {
  if (!tier.spirits.level) {
    return []; // Beer & Wine tier has no spirits
  }

  const spiritLevel = SPIRIT_PRODUCTS[tier.spirits.level];

  if (tier.spirits.pickCount === 'all') {
    // Deluxe tier gets all 5 spirits
    return Object.values(spiritLevel);
  }

  // Other tiers get only the selected spirits
  return selectedSpirits.map((spiritType) => spiritLevel[spiritType]);
}

/** Get all spirit types */
export const ALL_SPIRIT_TYPES: SpiritType[] = [
  'vodka',
  'tequila',
  'whiskey',
  'gin',
  'rum',
];

/** Default spirit selection for Pick 3 */
export const DEFAULT_SPIRITS: SpiritType[] = ['vodka', 'tequila', 'whiskey'];
