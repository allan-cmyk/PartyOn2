/**
 * Wedding Package Types
 * TypeScript interfaces for the wedding order calculator
 */

/** The 5 wedding package tiers */
export type WeddingTier =
  | 'beer-wine-special'
  | 'affordable-full-bar'
  | 'standard-bar'
  | 'texas-bar'
  | 'deluxe-bar';

/** Spirit types available for selection */
export type SpiritType = 'vodka' | 'tequila' | 'whiskey' | 'gin' | 'rum';

/** Wine quality tiers */
export type WineLevel = 'house' | 'standard' | 'deluxe';

/** Beer types */
export type BeerType = 'domestic' | 'craft';

/** Spirit quality tiers */
export type SpiritLevel = 'house' | 'texas' | 'deluxe';

/** Product category for calculations */
export type ProductCategory = 'wine' | 'beer' | 'spirits' | 'champagne';

/** A product in our catalog mapped to Shopify */
export interface WeddingProduct {
  name: string;
  handle: string; // Shopify product handle
  category: ProductCategory;
  subcategory?: string; // e.g., 'vodka', 'red', 'craft'
  servingsPerUnit: number;
  unitLabel: string; // e.g., '750ml', '12-pack'
  estimatedPrice: number; // For display before Shopify fetch
}

/** Configuration for each tier */
export interface TierConfig {
  id: WeddingTier;
  name: string;
  pricePerPerson: number;
  description: string;
  features: string[];
  wines: {
    house: number; // Number of house wine varieties
    standard: number;
    deluxe: number;
  };
  beer: {
    domestic: number;
    craft: number;
  };
  spirits: {
    level: SpiritLevel | null; // null for beer-wine-special
    pickCount: number | 'all'; // 3 for most, 'all' for deluxe
  };
  includesChampagne: boolean;
}

/** User input for the calculator */
export interface WeddingOrderInput {
  guestCount: number;
  eventHours: number;
  tier: WeddingTier;
  selectedSpirits: SpiritType[]; // Which 3 (or 5) spirits selected
  includeChampagneToast: boolean; // Optional champagne toast add-on
}

/** A calculated item in the package */
export interface CalculatedItem {
  product: WeddingProduct;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variantId?: string; // Resolved Shopify variant ID
  available: boolean;
}

/** Full package calculation result */
export interface CalculatedPackage {
  tier: TierConfig;
  items: CalculatedItem[];
  totalPrice: number;
  pricePerPerson: number;
  totalBottles: number;
  guestCount: number;
  eventHours: number;
}

/** Cart item format for createCartWithItems */
export interface CartLineItem {
  merchandiseId: string;
  quantity: number;
}
