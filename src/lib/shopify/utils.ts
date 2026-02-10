/**
 * @deprecated Import from '@/lib/utils' instead
 * This file re-exports for backward compatibility
 */
export { formatPrice } from '@/lib/utils/format';
export {
  getFirstAvailableVariant,
  getProductImageUrl,
  getRawProductImageUrl,
  getMetafieldValue,
  isAlcoholProduct,
  getProductABV,
  canPurchaseAlcohol,
} from '@/lib/utils/product';
export {
  getEarliestDeliveryDate,
  formatDeliveryDate,
  isValidDeliveryArea,
  getOrderMinimum,
} from '@/lib/utils/delivery';
export {
  getStoredCartId,
  setStoredCartId,
  clearStoredCartId,
} from '@/lib/utils/cart-storage';
