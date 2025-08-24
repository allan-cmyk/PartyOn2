import { ShopifyProduct, ShopifyProductVariant } from './types';

// Format price for display
export function formatPrice(amount: string, currencyCode: string = 'USD'): string {
  const numericAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(numericAmount);
}

// Get the first available variant
export function getFirstAvailableVariant(product: ShopifyProduct): ShopifyProductVariant | null {
  const availableVariant = product.variants.edges.find(
    ({ node }) => node.availableForSale
  );
  return availableVariant?.node || null;
}

// Get product image URL
export function getProductImageUrl(product: ShopifyProduct, index: number = 0): string {
  const image = product.images.edges[index]?.node;
  return image?.url || '/images/placeholder-product.png';
}

// Extract metafield value (simplified for single metafield)
export function getMetafieldValue(product: ShopifyProduct): string | null {
  return product.metafield?.value || null;
}

// Check if product is alcohol
export function isAlcoholProduct(product: ShopifyProduct): boolean {
  const alcoholTypes = ['spirits', 'wine', 'beer', 'liquor', 'champagne'];
  const productType = product.productType.toLowerCase();
  const tags = product.tags.map(tag => tag.toLowerCase());
  
  return alcoholTypes.some(type => 
    productType.includes(type) || tags.includes(type)
  );
}

// Get ABV from metafields
export function getProductABV(product: ShopifyProduct): string | null {
  return product.metafield?.value || null;
}

// Check if user can purchase alcohol (basic check)
export function canPurchaseAlcohol(): boolean {
  // This is a placeholder - in production, check actual age verification
  const ageVerified = localStorage.getItem('age_verified');
  return ageVerified === 'true';
}

// Calculate delivery date (72 hours minimum)
export function getEarliestDeliveryDate(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 72); // 72 hours from now
  return date;
}

// Format delivery date
export function formatDeliveryDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Validate delivery address (basic Austin area check)
export function isValidDeliveryArea(zipCode: string): boolean {
  const austinZipCodes = [
    '78701', '78702', '78703', '78704', '78705',
    '78712', '78721', '78722', '78723', '78724',
    '78725', '78726', '78727', '78728', '78729',
    '78730', '78731', '78732', '78733', '78734',
    '78735', '78736', '78737', '78738', '78739',
    '78741', '78742', '78744', '78745', '78746',
    '78747', '78748', '78749', '78750', '78751',
    '78752', '78753', '78754', '78756', '78757',
    '78758', '78759',
  ];
  
  return austinZipCodes.includes(zipCode);
}

// Get order minimum for area
export function getOrderMinimum(zipCode: string): number {
  // Premium areas have higher minimums
  const premiumZipCodes = ['78746', '78733', '78738', '78732'];
  
  if (premiumZipCodes.includes(zipCode)) {
    return 150; // $150 minimum for premium areas
  }
  
  return 100; // $100 minimum for standard areas
}

// Cart storage helpers
export function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('shopify_cart_id');
}

export function setStoredCartId(cartId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('shopify_cart_id', cartId);
}

export function clearStoredCartId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('shopify_cart_id');
}