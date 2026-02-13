/**
 * Tax Module
 * Configurable tax calculation for Party On Delivery
 */

export { DEFAULT_TAX_RATE, getTaxRateForZip, isInDeliveryArea, getSupportedZipCodes, getCityForZip, ALCOHOL_TAX_INFO } from './rates';
export { calculateTax, calculateCartTax, getTaxBreakdown, validateTaxAmount } from './calculator';
export type { TaxCalculationInput, TaxCalculationResult } from './calculator';
