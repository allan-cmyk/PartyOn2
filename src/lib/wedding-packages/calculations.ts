/**
 * Wedding Package Quantity Calculations
 * Calculates how many bottles/packs are needed based on guest count and event duration
 */

import type {
  WeddingTier,
  WeddingOrderInput,
  CalculatedItem,
  CalculatedPackage,
  WeddingProduct,
  SpiritType,
} from './types';

import {
  getTierConfig,
  getWinesForTier,
  getBeersForTier,
  getSpiritsForTier,
  CHAMPAGNE_PRODUCT,
} from './tier-config';

// ============================================================================
// CONSUMPTION RATES
// ============================================================================

/**
 * Drink distribution for full bar (with spirits)
 * Total should equal 100%
 */
const DRINK_MIX_FULL_BAR = {
  spirits: 30,
  wine: 40,
  beer: 30,
};

/**
 * Drink distribution for beer & wine only
 * Total should equal 100%
 */
const DRINK_MIX_BEER_WINE = {
  spirits: 0,
  wine: 55,
  beer: 45,
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate total drinks needed for the event
 * Uses the proven formula from WeddingDrinkCalculator:
 * - Average drinkers: guests × (hours + 1)
 * This accounts for the first hour being heavier and natural tapering
 */
function calculateTotalDrinks(guestCount: number, eventHours: number): number {
  // Formula: guests * (hours + 1) for average wedding drinkers
  // The +1 accounts for heavier drinking in the first hour (cocktail hour)
  return guestCount * (eventHours + 1);
}

/**
 * Calculate quantity needed for a specific product
 */
function calculateProductQuantity(
  totalDrinksForCategory: number,
  product: WeddingProduct,
  productCountInCategory: number
): number {
  // Divide drinks among products in category, then divide by servings per unit
  const drinksPerProduct = totalDrinksForCategory / productCountInCategory;
  const quantity = Math.ceil(drinksPerProduct / product.servingsPerUnit);

  // Minimum 1 of each product
  return Math.max(1, quantity);
}

/**
 * Calculate champagne bottles needed for toast
 * One toast per person = 1 serving per person
 */
function calculateChampagneQuantity(guestCount: number): number {
  // 5 servings per bottle, round up
  return Math.ceil(guestCount / CHAMPAGNE_PRODUCT.servingsPerUnit);
}

/**
 * Main calculation function - generates full package breakdown
 */
export function calculateWeddingPackage(input: WeddingOrderInput): CalculatedPackage {
  const { guestCount, eventHours, tier, selectedSpirits } = input;

  const tierConfig = getTierConfig(tier);
  const hasSpirits = tierConfig.spirits.level !== null;

  // Get drink mix based on whether tier includes spirits
  const drinkMix = hasSpirits ? DRINK_MIX_FULL_BAR : DRINK_MIX_BEER_WINE;

  // Calculate total drinks per category
  const totalDrinks = calculateTotalDrinks(guestCount, eventHours);
  const spiritsDrinks = Math.ceil(totalDrinks * (drinkMix.spirits / 100));
  const wineDrinks = Math.ceil(totalDrinks * (drinkMix.wine / 100));
  const beerDrinks = Math.ceil(totalDrinks * (drinkMix.beer / 100));

  const items: CalculatedItem[] = [];
  let totalPrice = 0;
  let totalBottles = 0;

  // ---- WINES ----
  const wines = getWinesForTier(tierConfig);
  wines.forEach((wine) => {
    const quantity = calculateProductQuantity(wineDrinks, wine, wines.length);
    const subtotal = quantity * wine.estimatedPrice;

    items.push({
      product: wine,
      quantity,
      unitPrice: wine.estimatedPrice,
      subtotal,
      available: true,
    });

    totalPrice += subtotal;
    totalBottles += quantity;
  });

  // ---- BEERS ----
  const beers = getBeersForTier(tierConfig);
  beers.forEach((beer) => {
    const quantity = calculateProductQuantity(beerDrinks, beer, beers.length);
    const subtotal = quantity * beer.estimatedPrice;

    items.push({
      product: beer,
      quantity,
      unitPrice: beer.estimatedPrice,
      subtotal,
      available: true,
    });

    totalPrice += subtotal;
    totalBottles += quantity;
  });

  // ---- SPIRITS ----
  if (hasSpirits) {
    const spirits = getSpiritsForTier(tierConfig, selectedSpirits);
    spirits.forEach((spirit) => {
      const quantity = calculateProductQuantity(spiritsDrinks, spirit, spirits.length);
      const subtotal = quantity * spirit.estimatedPrice;

      items.push({
        product: spirit,
        quantity,
        unitPrice: spirit.estimatedPrice,
        subtotal,
        available: true,
      });

      totalPrice += subtotal;
      totalBottles += quantity;
    });
  }

  // ---- CHAMPAGNE TOAST ----
  if (tierConfig.includesChampagne) {
    const champagneQty = calculateChampagneQuantity(guestCount);
    const champagneSubtotal = champagneQty * CHAMPAGNE_PRODUCT.estimatedPrice;

    items.push({
      product: CHAMPAGNE_PRODUCT,
      quantity: champagneQty,
      unitPrice: CHAMPAGNE_PRODUCT.estimatedPrice,
      subtotal: champagneSubtotal,
      available: true,
    });

    totalPrice += champagneSubtotal;
    totalBottles += champagneQty;
  }

  return {
    tier: tierConfig,
    items,
    totalPrice: Math.round(totalPrice * 100) / 100,
    pricePerPerson: Math.round((totalPrice / guestCount) * 100) / 100,
    totalBottles,
    guestCount,
    eventHours,
  };
}

/**
 * Get a quick price estimate without full calculation
 * Useful for tier cards preview
 */
export function getEstimatedTotal(
  guestCount: number,
  tier: WeddingTier
): number {
  const tierConfig = getTierConfig(tier);
  return guestCount * tierConfig.pricePerPerson;
}

/**
 * Validate spirit selection
 * Returns error message or null if valid
 */
export function validateSpiritSelection(
  tier: WeddingTier,
  selectedSpirits: SpiritType[]
): string | null {
  const tierConfig = getTierConfig(tier);

  // Beer & Wine tier doesn't need spirits
  if (tierConfig.spirits.level === null) {
    return null;
  }

  // Deluxe tier gets all spirits automatically
  if (tierConfig.spirits.pickCount === 'all') {
    return null;
  }

  // Other tiers need exactly 3 spirits selected
  const requiredCount = tierConfig.spirits.pickCount as number;

  if (selectedSpirits.length < requiredCount) {
    return `Please select ${requiredCount} spirit types`;
  }

  if (selectedSpirits.length > requiredCount) {
    return `Please select only ${requiredCount} spirit types`;
  }

  return null;
}

/**
 * Check if a tier requires spirit selection
 */
export function tierRequiresSpiritPicker(tier: WeddingTier): boolean {
  const tierConfig = getTierConfig(tier);
  return (
    tierConfig.spirits.level !== null &&
    tierConfig.spirits.pickCount !== 'all'
  );
}
