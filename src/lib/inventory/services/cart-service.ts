/**
 * Cart Service
 * Note: Local Cart model not implemented - cart managed via Shopify
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export interface CartWithItems {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
}

export interface AddToCartInput {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}

export interface DeliveryInfo {
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress: unknown;
  deliveryPhone: string;
  deliveryInstructions?: string;
}

const NOT_IMPLEMENTED = 'Cart managed via Shopify - local cart not implemented';

export async function getOrCreateCart(_customerId?: string, _sessionId?: string): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function getCartById(_cartId: string): Promise<CartWithItems | null> {
  return null;
}

export async function addToCart(
  _cartId: string,
  _item: AddToCartInput
): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function updateCartItem(
  _cartId: string,
  _update: UpdateCartItemInput
): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function removeFromCart(_cartId: string, _itemId: string): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function clearCart(_cartId: string): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function setDeliveryInfo(
  _cartId: string,
  _info: DeliveryInfo
): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function applyDiscount(
  _cartId: string,
  _discountCode: string,
  _amount: number
): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function removeDiscount(_cartId: string): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function associateWithGroupOrder(
  _cartId: string,
  _groupOrderId: string
): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function markCartConverted(_cartId: string): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function markCartAbandoned(_cartId: string): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function mergeGuestCart(
  _guestCartId: string,
  _customerCartId: string
): Promise<CartWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

export function validateCartMinimum(_cart: CartWithItems): { valid: boolean; minimum: number; current: number } {
  return { valid: false, minimum: 100, current: 0 };
}

export function hasDeliveryInfo(_cart: CartWithItems): boolean {
  return false;
}

export function cartToCheckoutData(_cart: CartWithItems): Record<string, unknown> {
  return {};
}
