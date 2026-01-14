/**
 * Discount Engine
 * Note: Local Discount models not implemented - discounts managed via Shopify
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  categoryId?: string;
}

interface CartContext {
  items: CartItem[];
  subtotal: number;
  customerId?: string;
  isFirstOrder?: boolean;
}

interface DiscountResult {
  success: boolean;
  discountAmount: number;
  discountCode?: string;
  discountType?: string;
  message?: string;
  error?: string;
}

interface AppliedDiscount {
  id: string;
  name: string;
  code?: string;
  type: string;
  amount: number;
  isAutomatic: boolean;
}

const NOT_IMPLEMENTED_ERROR = 'Discounts managed via Shopify - local discount engine not implemented';

/**
 * Validate a discount code for the given cart context (stub)
 */
export async function validateDiscountCode(
  _code: string,
  _context: CartContext
): Promise<DiscountResult> {
  return {
    success: false,
    discountAmount: 0,
    error: NOT_IMPLEMENTED_ERROR,
  };
}

/**
 * Get all applicable automatic discounts for the cart (stub)
 */
export async function getAutomaticDiscounts(
  _context: CartContext
): Promise<AppliedDiscount[]> {
  return [];
}

/**
 * Record discount usage after order completion (stub)
 */
export async function recordDiscountUsage(
  _discountCode: string,
  _orderId: string,
  _customerId: string | null,
  _amountSaved: number
): Promise<void> {
  // No-op - discounts managed via Shopify
}

/**
 * Check if free shipping should be applied (stub)
 */
export async function shouldApplyFreeShipping(
  _discountCode: string | null,
  _context: CartContext
): Promise<boolean> {
  return false;
}
