/**
 * Delivery Rate Engine
 * Calculates delivery fees based on zip code zones
 */

/**
 * Delivery zone configuration
 */
export interface DeliveryZone {
  name: string;
  description: string;
  baseRate: number;
  expressRate: number;
  minimumOrder: number;
  freeDeliveryThreshold: number | null;
  zipCodes: string[];
}

/**
 * Delivery rate calculation result
 */
export interface DeliveryRateResult {
  zone: string;
  baseRate: number;
  expressRate: number;
  minimumOrder: number;
  freeDeliveryThreshold: number | null;
  isEligible: boolean;
  reason?: string;
}

/**
 * Calculated delivery fee result
 */
export interface CalculatedDeliveryFee {
  fee: number;
  originalFee: number;
  discountApplied: boolean;
  discountReason?: string;
  zone: string;
  isExpress: boolean;
  minimumOrderMet: boolean;
}

/**
 * Delivery zones for Austin area
 * Organized by proximity to downtown for delivery efficiency
 */
export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    name: 'Central Austin',
    description: 'Downtown, UT Campus, East Austin, South Congress',
    baseRate: 25,
    expressRate: 40,
    minimumOrder: 100,
    freeDeliveryThreshold: 250,
    zipCodes: [
      '78701', // Downtown
      '78702', // East Austin
      '78703', // Tarrytown/West Austin
      '78704', // South Austin/SoCo
      '78705', // UT Campus
      '78751', // Hyde Park
      '78752', // Crestview
      '78756', // Brentwood
      '78757', // Allandale
    ],
  },
  {
    name: 'Greater Austin',
    description: 'North Austin, South Austin, Round Rock',
    baseRate: 30,
    expressRate: 50,
    minimumOrder: 125,
    freeDeliveryThreshold: 300,
    zipCodes: [
      '78617', // Del Valle
      '78652', // Manchaca
      '78653', // Manor
      '78660', // Pflugerville
      '78664', // Round Rock
      '78681', // Round Rock
      '78717', // Northwest Austin
      '78719', // Austin-Bergstrom area
      '78721', // East Austin
      '78722', // Cherrywood
      '78723', // Windsor Park
      '78724', // East Austin
      '78725', // Southeast Austin
      '78727', // North Austin
      '78728', // North Austin (Wells Branch)
      '78729', // Northwest Austin
      '78731', // Northwest Hills
      '78732', // Steiner Ranch
      '78733', // Bee Cave area
      '78734', // Lakeway
      '78735', // Southwest Austin
      '78736', // Oak Hill
      '78737', // Bee Cave
      '78738', // Bee Cave
      '78739', // Circle C
      '78741', // Southeast Austin
      '78744', // South Austin
      '78745', // South Austin
      '78746', // West Lake Hills
      '78747', // South Austin
      '78748', // South Austin
      '78749', // Southwest Austin
      '78750', // Northwest Austin
      '78753', // North Austin
      '78754', // Northeast Austin
      '78758', // North Austin
      '78759', // Northwest Austin
    ],
  },
  {
    name: 'Extended Austin',
    description: 'Cedar Park, Georgetown, Dripping Springs',
    baseRate: 40,
    expressRate: 65,
    minimumOrder: 150,
    freeDeliveryThreshold: 400,
    zipCodes: [
      '78613', // Cedar Park
      '78620', // Dripping Springs
      '78626', // Georgetown
      '78628', // Georgetown
      '78633', // Georgetown
      '78641', // Leander
      '78642', // Liberty Hill
      '78665', // Round Rock (far)
      '78669', // Spicewood
      '78676', // Wimberley
      '78726', // Austin (Four Points)
    ],
  },
];

/**
 * Default rate for unknown zip codes (outside service area)
 */
export const DEFAULT_RATE: DeliveryRateResult = {
  zone: 'Outside Service Area',
  baseRate: 0,
  expressRate: 0,
  minimumOrder: 0,
  freeDeliveryThreshold: null,
  isEligible: false,
  reason: 'This zip code is outside our delivery area',
};

/**
 * Get delivery zone for a zip code
 */
export function getDeliveryZone(zipCode: string): DeliveryZone | null {
  const normalizedZip = zipCode.trim().substring(0, 5);

  for (const zone of DELIVERY_ZONES) {
    if (zone.zipCodes.includes(normalizedZip)) {
      return zone;
    }
  }

  return null;
}

/**
 * Get delivery rate information for a zip code
 */
export function getDeliveryRate(zipCode: string): DeliveryRateResult {
  const zone = getDeliveryZone(zipCode);

  if (!zone) {
    return DEFAULT_RATE;
  }

  return {
    zone: zone.name,
    baseRate: zone.baseRate,
    expressRate: zone.expressRate,
    minimumOrder: zone.minimumOrder,
    freeDeliveryThreshold: zone.freeDeliveryThreshold,
    isEligible: true,
  };
}

/**
 * Check if a zip code is within the delivery area
 */
export function isInDeliveryArea(zipCode: string): boolean {
  return getDeliveryZone(zipCode) !== null;
}

/**
 * Calculate delivery fee based on order total, zip code, and delivery type
 */
export function calculateDeliveryFee(
  zipCode: string,
  orderSubtotal: number,
  isExpress: boolean = false
): CalculatedDeliveryFee {
  const zone = getDeliveryZone(zipCode);

  if (!zone) {
    return {
      fee: 0,
      originalFee: 0,
      discountApplied: false,
      zone: 'Outside Service Area',
      isExpress,
      minimumOrderMet: false,
    };
  }

  const baseRate = isExpress ? zone.expressRate : zone.baseRate;
  const minimumOrderMet = orderSubtotal >= zone.minimumOrder;

  // Check if free delivery threshold is met
  const freeDeliveryMet = zone.freeDeliveryThreshold !== null &&
                          orderSubtotal >= zone.freeDeliveryThreshold &&
                          !isExpress; // Free delivery doesn't apply to express

  return {
    fee: freeDeliveryMet ? 0 : baseRate,
    originalFee: baseRate,
    discountApplied: freeDeliveryMet,
    discountReason: freeDeliveryMet
      ? `Free delivery for orders over $${zone.freeDeliveryThreshold}`
      : undefined,
    zone: zone.name,
    isExpress,
    minimumOrderMet,
  };
}

/**
 * Get minimum order amount for a zip code
 */
export function getMinimumOrder(zipCode: string): number {
  const zone = getDeliveryZone(zipCode);
  return zone?.minimumOrder ?? 100; // Default fallback
}

/**
 * Get free delivery threshold for a zip code
 */
export function getFreeDeliveryThreshold(zipCode: string): number | null {
  const zone = getDeliveryZone(zipCode);
  return zone?.freeDeliveryThreshold ?? null;
}

/**
 * Get all zip codes in the delivery area
 */
export function getAllDeliveryZipCodes(): string[] {
  return DELIVERY_ZONES.flatMap(zone => zone.zipCodes);
}

/**
 * Get delivery zones summary (for display purposes)
 */
export function getDeliveryZonesSummary(): Array<{
  name: string;
  description: string;
  baseRate: number;
  expressRate: number;
  minimumOrder: number;
  freeDeliveryThreshold: number | null;
  zipCodeCount: number;
}> {
  return DELIVERY_ZONES.map(zone => ({
    name: zone.name,
    description: zone.description,
    baseRate: zone.baseRate,
    expressRate: zone.expressRate,
    minimumOrder: zone.minimumOrder,
    freeDeliveryThreshold: zone.freeDeliveryThreshold,
    zipCodeCount: zone.zipCodes.length,
  }));
}

/**
 * Validate order meets minimum for delivery
 */
export function validateOrderMinimum(
  zipCode: string,
  orderSubtotal: number
): { valid: boolean; minimumOrder: number; shortfall: number } {
  const zone = getDeliveryZone(zipCode);
  const minimumOrder = zone?.minimumOrder ?? 100;
  const valid = orderSubtotal >= minimumOrder;

  return {
    valid,
    minimumOrder,
    shortfall: valid ? 0 : minimumOrder - orderSubtotal,
  };
}
