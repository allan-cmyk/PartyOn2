/** Cart storage helpers */

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
