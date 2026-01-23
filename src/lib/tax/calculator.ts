/**
 * Tax Calculator
 * Calculates sales tax for orders based on delivery address
 */

import { getTaxRateForZip, DEFAULT_TAX_RATE, isInDeliveryArea } from './rates';

export interface TaxCalculationInput {
  /** Subtotal before tax (after discounts) */
  taxableAmount: number;
  /** Delivery zip code */
  zipCode?: string;
}

export interface TaxCalculationResult {
  /** Calculated tax amount */
  taxAmount: number;
  /** Tax rate applied (e.g., 0.0825 for 8.25%) */
  taxRate: number;
  /** Tax rate as percentage string (e.g., "8.25%") */
  taxRateDisplay: string;
  /** Description of tax jurisdiction */
  description: string;
  /** Whether the zip code is in the delivery area */
  isDeliveryArea: boolean;
}

/**
 * Calculate tax for an order
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { taxableAmount, zipCode } = input;

  // Get tax rate for zip code
  let taxRate = DEFAULT_TAX_RATE;
  let description = 'Texas Sales Tax';
  let isDeliveryAreaFlag = true;

  if (zipCode) {
    const rateConfig = getTaxRateForZip(zipCode);
    taxRate = rateConfig.rate;
    description = `${rateConfig.description} Sales Tax`;
    isDeliveryAreaFlag = isInDeliveryArea(zipCode);
  }

  // Calculate tax (ensure non-negative)
  const taxAmount = Math.max(0, taxableAmount * taxRate);

  // Round to 2 decimal places
  const roundedTax = Math.round(taxAmount * 100) / 100;

  return {
    taxAmount: roundedTax,
    taxRate,
    taxRateDisplay: `${(taxRate * 100).toFixed(2)}%`,
    description,
    isDeliveryArea: isDeliveryAreaFlag,
  };
}

/**
 * Calculate tax for cart
 * Convenience function that handles cart-specific logic
 */
export function calculateCartTax(params: {
  subtotal: number;
  discountAmount: number;
  zipCode?: string;
}): TaxCalculationResult {
  const { subtotal, discountAmount, zipCode } = params;

  // Calculate taxable amount (subtotal minus discount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  return calculateTax({
    taxableAmount,
    zipCode,
  });
}

/**
 * Get tax breakdown for display
 */
export function getTaxBreakdown(taxResult: TaxCalculationResult): string {
  return `${taxResult.description} (${taxResult.taxRateDisplay}): $${taxResult.taxAmount.toFixed(2)}`;
}

/**
 * Validate tax amount
 * Used to verify tax calculations match expected ranges
 */
export function validateTaxAmount(params: {
  calculatedTax: number;
  subtotal: number;
  discountAmount: number;
}): { valid: boolean; error?: string } {
  const { calculatedTax, subtotal, discountAmount } = params;

  // Tax should never be negative
  if (calculatedTax < 0) {
    return { valid: false, error: 'Tax amount cannot be negative' };
  }

  // Calculate expected range (6.25% to 8.25% of taxable amount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const minExpectedTax = taxableAmount * 0.0625 * 0.99; // Allow 1% variance
  const maxExpectedTax = taxableAmount * 0.0825 * 1.01;

  if (calculatedTax < minExpectedTax || calculatedTax > maxExpectedTax) {
    return {
      valid: false,
      error: `Tax amount ${calculatedTax.toFixed(2)} outside expected range ${minExpectedTax.toFixed(2)}-${maxExpectedTax.toFixed(2)}`,
    };
  }

  return { valid: true };
}
