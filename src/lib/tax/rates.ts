/**
 * Tax Rate Configuration
 * Texas-only tax rates with zip code mapping for Austin delivery area
 */

// Texas state sales tax rate
const TEXAS_STATE_TAX_RATE = 0.0625; // 6.25%

// Austin local tax (City of Austin MUD/Special districts vary)
const AUSTIN_LOCAL_TAX_RATE = 0.02; // 2.00%

// Default combined rate for Austin area
export const DEFAULT_TAX_RATE = TEXAS_STATE_TAX_RATE + AUSTIN_LOCAL_TAX_RATE; // 8.25%

/**
 * Tax rate configuration by zip code
 * Most Austin area zip codes use 8.25%, but some areas have different rates
 */
interface TaxRateConfig {
  rate: number;
  description: string;
  city?: string;
}

const ZIP_CODE_TAX_RATES: Record<string, TaxRateConfig> = {
  // Central Austin - 8.25%
  '78701': { rate: 0.0825, description: 'Downtown Austin', city: 'Austin' },
  '78702': { rate: 0.0825, description: 'East Austin', city: 'Austin' },
  '78703': { rate: 0.0825, description: 'West Austin/Tarrytown', city: 'Austin' },
  '78704': { rate: 0.0825, description: 'South Austin/Travis Heights', city: 'Austin' },
  '78705': { rate: 0.0825, description: 'UT/Hyde Park', city: 'Austin' },
  '78731': { rate: 0.0825, description: 'Northwest Hills', city: 'Austin' },
  '78751': { rate: 0.0825, description: 'Hyde Park/North Loop', city: 'Austin' },
  '78752': { rate: 0.0825, description: 'North Austin', city: 'Austin' },
  '78756': { rate: 0.0825, description: 'Rosedale', city: 'Austin' },
  '78757': { rate: 0.0825, description: 'Crestview', city: 'Austin' },
  '78758': { rate: 0.0825, description: 'North Austin/Domain', city: 'Austin' },
  '78759': { rate: 0.0825, description: 'Northwest Austin', city: 'Austin' },

  // South Austin
  '78741': { rate: 0.0825, description: 'Riverside/Oltorf', city: 'Austin' },
  '78744': { rate: 0.0825, description: 'Southeast Austin', city: 'Austin' },
  '78745': { rate: 0.0825, description: 'South Austin/Slaughter', city: 'Austin' },
  '78746': { rate: 0.0825, description: 'West Lake Hills', city: 'West Lake Hills' },
  '78748': { rate: 0.0825, description: 'South Austin/Circle C', city: 'Austin' },
  '78749': { rate: 0.0825, description: 'Southwest Austin', city: 'Austin' },

  // East Austin
  '78721': { rate: 0.0825, description: 'East Austin', city: 'Austin' },
  '78722': { rate: 0.0825, description: 'Cherrywood', city: 'Austin' },
  '78723': { rate: 0.0825, description: 'Windsor Park', city: 'Austin' },
  '78724': { rate: 0.0825, description: 'Northeast Austin', city: 'Austin' },
  '78725': { rate: 0.0825, description: 'East Austin', city: 'Austin' },

  // Lake Travis Area - Some areas have different rates
  '78732': { rate: 0.0825, description: 'Steiner Ranch', city: 'Austin' },
  '78733': { rate: 0.0825, description: 'Bee Cave area', city: 'Austin' },
  '78734': { rate: 0.0825, description: 'Lakeway', city: 'Lakeway' },
  '78735': { rate: 0.0825, description: 'Oak Hill', city: 'Austin' },
  '78736': { rate: 0.0825, description: 'Bee Cave', city: 'Bee Cave' },
  '78737': { rate: 0.0825, description: 'Dripping Springs area', city: 'Austin' },
  '78738': { rate: 0.0825, description: 'Bee Cave/Lakeway', city: 'Bee Cave' },
  '78739': { rate: 0.0825, description: 'Circle C/MoPac South', city: 'Austin' },

  // North Austin suburbs
  '78613': { rate: 0.0825, description: 'Cedar Park', city: 'Cedar Park' },
  '78660': { rate: 0.0825, description: 'Pflugerville', city: 'Pflugerville' },
  '78664': { rate: 0.0825, description: 'Round Rock', city: 'Round Rock' },
  '78665': { rate: 0.0825, description: 'Round Rock', city: 'Round Rock' },
  '78681': { rate: 0.0825, description: 'Round Rock', city: 'Round Rock' },
  '78717': { rate: 0.0825, description: 'Brushy Creek', city: 'Austin' },
  '78727': { rate: 0.0825, description: 'North Austin', city: 'Austin' },
  '78728': { rate: 0.0825, description: 'Wells Branch', city: 'Austin' },
  '78729': { rate: 0.0825, description: 'Northwest Austin', city: 'Austin' },
  '78750': { rate: 0.0825, description: 'Northwest Austin/Anderson Mill', city: 'Austin' },
  '78753': { rate: 0.0825, description: 'North Austin', city: 'Austin' },
  '78754': { rate: 0.0825, description: 'Northeast Austin', city: 'Austin' },

  // South suburbs
  '78610': { rate: 0.0825, description: 'Buda', city: 'Buda' },
  '78640': { rate: 0.0825, description: 'Kyle', city: 'Kyle' },
  '78652': { rate: 0.0825, description: 'Manchaca', city: 'Austin' },
  '78669': { rate: 0.0825, description: 'Spicewood', city: 'Spicewood' },

  // Georgetown area (Williamson County - slightly different)
  '78626': { rate: 0.0825, description: 'Georgetown', city: 'Georgetown' },
  '78628': { rate: 0.0825, description: 'Georgetown', city: 'Georgetown' },
  '78633': { rate: 0.0825, description: 'Georgetown', city: 'Georgetown' },

  // Manor area
  '78653': { rate: 0.0825, description: 'Manor', city: 'Manor' },
};

/**
 * Get tax rate for a zip code
 * Returns default Austin rate if zip code not found
 */
export function getTaxRateForZip(zipCode: string): TaxRateConfig {
  const normalizedZip = zipCode.trim().substring(0, 5);

  if (ZIP_CODE_TAX_RATES[normalizedZip]) {
    return ZIP_CODE_TAX_RATES[normalizedZip];
  }

  // Check if it starts with 78 (Austin area)
  if (normalizedZip.startsWith('78')) {
    return {
      rate: DEFAULT_TAX_RATE,
      description: 'Austin Metro Area',
      city: 'Austin',
    };
  }

  // For non-Austin Texas zip codes, use state rate + estimate
  return {
    rate: DEFAULT_TAX_RATE,
    description: 'Texas Standard Rate',
  };
}

/**
 * Check if a zip code is in the delivery area
 */
export function isInDeliveryArea(zipCode: string): boolean {
  const normalizedZip = zipCode.trim().substring(0, 5);

  // Explicitly listed zip codes
  if (ZIP_CODE_TAX_RATES[normalizedZip]) {
    return true;
  }

  // Austin area zip codes (78xxx range with some exclusions)
  if (normalizedZip.startsWith('78')) {
    const zipNum = parseInt(normalizedZip, 10);
    // Most 78xxx are Austin area, but exclude far ones
    return zipNum >= 78600 && zipNum <= 78799;
  }

  return false;
}

/**
 * Get all supported zip codes
 */
export function getSupportedZipCodes(): string[] {
  return Object.keys(ZIP_CODE_TAX_RATES);
}

/**
 * Get city name for zip code
 */
export function getCityForZip(zipCode: string): string {
  const config = getTaxRateForZip(zipCode);
  return config.city || 'Austin';
}

/**
 * Texas alcohol-specific tax info
 * Note: Texas does NOT have a separate alcohol sales tax for off-premise sales
 * The standard sales tax applies to alcohol purchases
 */
export const ALCOHOL_TAX_INFO = {
  hasSpecialRate: false,
  notes: 'Texas applies standard sales tax to alcohol. No additional retail alcohol tax.',
};
