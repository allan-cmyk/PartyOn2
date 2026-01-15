/**
 * Cart Service
 * Server-side cart management with database persistence
 */

import { prisma } from '@/lib/database/client';
import { Prisma, Cart, CartItem } from '@prisma/client';

// ==========================================
// Types
// ==========================================

export interface CartWithItems extends Cart {
  items: Array<CartItem & {
    product: { id: string; title: string; handle: string };
    variant: { id: string; title: string; sku: string | null; price: Prisma.Decimal };
  }>;
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
  date: Date;
  time: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  phone: string;
  instructions?: string;
}

// Tax rate for Austin, TX
const TAX_RATE = 0.0825;
const _DEFAULT_DELIVERY_FEE = 25; // eslint-disable-line @typescript-eslint/no-unused-vars

// ==========================================
// Cart Operations
// ==========================================

/**
 * Get or create a cart for a customer or session
 */
export async function getOrCreateCart(
  customerId?: string,
  sessionId?: string
): Promise<CartWithItems> {
  if (!customerId && !sessionId) {
    throw new Error('Either customerId or sessionId is required');
  }

  // Try to find existing active cart
  let cart = await prisma.cart.findFirst({
    where: {
      status: 'ACTIVE',
      ...(customerId ? { customerId } : { sessionId }),
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, handle: true } },
          variant: { select: { id: true, title: true, sku: true, price: true } },
        },
      },
    },
  });

  if (!cart) {
    // Create new cart
    cart = await prisma.cart.create({
      data: {
        customerId,
        sessionId: customerId ? undefined : sessionId,
        status: 'ACTIVE',
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, handle: true } },
            variant: { select: { id: true, title: true, sku: true, price: true } },
          },
        },
      },
    });
  }

  return cart as CartWithItems;
}

/**
 * Get cart by ID
 */
export async function getCartById(cartId: string): Promise<CartWithItems | null> {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, handle: true } },
          variant: { select: { id: true, title: true, sku: true, price: true } },
        },
      },
    },
  }) as Promise<CartWithItems | null>;
}

/**
 * Add item to cart
 */
export async function addToCart(
  cartId: string,
  input: AddToCartInput
): Promise<CartWithItems> {
  const { productId, variantId, quantity, price } = input;

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId, variantId },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId,
        quantity,
        price: new Prisma.Decimal(price),
      },
    });
  }

  // Recalculate totals
  return recalculateCart(cartId);
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  cartId: string,
  input: UpdateCartItemInput
): Promise<CartWithItems> {
  const { itemId, quantity } = input;

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return recalculateCart(cartId);
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  cartId: string,
  itemId: string
): Promise<CartWithItems> {
  await prisma.cartItem.delete({ where: { id: itemId } });
  return recalculateCart(cartId);
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId: string): Promise<CartWithItems> {
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return recalculateCart(cartId);
}

/**
 * Set delivery information
 */
export async function setDeliveryInfo(
  cartId: string,
  delivery: DeliveryInfo
): Promise<CartWithItems> {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      deliveryDate: delivery.date,
      deliveryTime: delivery.time,
      deliveryAddress: delivery.address as Prisma.InputJsonValue,
      deliveryPhone: delivery.phone,
      deliveryInstructions: delivery.instructions,
    },
  });

  return recalculateCart(cartId);
}

/**
 * Apply discount code
 */
export async function applyDiscount(
  cartId: string,
  discountCode: string,
  discountAmount: number
): Promise<CartWithItems> {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      discountCode,
      discountAmount: new Prisma.Decimal(discountAmount),
    },
  });

  return recalculateCart(cartId);
}

/**
 * Remove discount code
 */
export async function removeDiscount(cartId: string): Promise<CartWithItems> {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      discountCode: null,
      discountAmount: new Prisma.Decimal(0),
    },
  });

  return recalculateCart(cartId);
}

/**
 * Associate cart with group order
 */
export async function associateWithGroupOrder(
  cartId: string,
  groupOrderId: string
): Promise<CartWithItems> {
  await prisma.cart.update({
    where: { id: cartId },
    data: { groupOrderId },
  });

  return getCartById(cartId) as Promise<CartWithItems>;
}

/**
 * Mark cart as converted (after successful checkout)
 */
export async function markCartConverted(cartId: string): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: { status: 'CONVERTED' },
  });
}

/**
 * Mark cart as abandoned
 */
export async function markCartAbandoned(cartId: string): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      status: 'ABANDONED',
      abandonedAt: new Date(),
    },
  });
}

/**
 * Merge guest cart into customer cart
 */
export async function mergeGuestCart(
  sessionId: string,
  customerId: string
): Promise<CartWithItems> {
  // Get guest cart
  const guestCart = await prisma.cart.findFirst({
    where: { sessionId, status: 'ACTIVE' },
    include: { items: true },
  });

  if (!guestCart) {
    // No guest cart to merge, just get/create customer cart
    return getOrCreateCart(customerId);
  }

  // Get or create customer cart
  const customerCart = await prisma.cart.findFirst({
    where: { customerId, status: 'ACTIVE' },
  });

  if (!customerCart) {
    // Transfer guest cart to customer
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: {
        customerId,
        sessionId: null,
      },
    });
    return getCartById(guestCart.id) as Promise<CartWithItems>;
  }

  // Merge items from guest cart to customer cart
  for (const item of guestCart.items) {
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: customerCart.id, variantId: item.variantId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: customerCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }
  }

  // Delete guest cart
  await prisma.cart.delete({ where: { id: guestCart.id } });

  return recalculateCart(customerCart.id);
}

// ==========================================
// Internal Helpers
// ==========================================

/**
 * Recalculate cart totals
 */
async function recalculateCart(cartId: string): Promise<CartWithItems> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, handle: true } },
          variant: { select: { id: true, title: true, sku: true, price: true } },
        },
      },
    },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (parseFloat(item.price.toString()) * item.quantity);
  }, 0);

  // Calculate tax
  const taxableAmount = subtotal - parseFloat(cart.discountAmount.toString());
  const taxAmount = Math.max(0, taxableAmount * TAX_RATE);

  // Calculate total
  const deliveryFee = parseFloat(cart.deliveryFee.toString());
  const discountAmount = parseFloat(cart.discountAmount.toString());
  const total = Math.max(0, subtotal - discountAmount + taxAmount + deliveryFee);

  // Update cart totals
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
      taxAmount: new Prisma.Decimal(taxAmount.toFixed(2)),
      total: new Prisma.Decimal(total.toFixed(2)),
    },
  });

  return getCartById(cartId) as Promise<CartWithItems>;
}

// ==========================================
// Cart Validation
// ==========================================

/**
 * Validate cart meets minimum order requirements
 */
export function validateCartMinimum(cart: CartWithItems): {
  valid: boolean;
  minimum: number;
  current: number;
  difference: number;
} {
  const minimum = 100; // $100 minimum
  const current = parseFloat(cart.subtotal.toString());
  const difference = minimum - current;

  return {
    valid: current >= minimum,
    minimum,
    current,
    difference: Math.max(0, difference),
  };
}

/**
 * Check if cart has delivery info
 */
export function hasDeliveryInfo(cart: CartWithItems): boolean {
  return !!(cart.deliveryDate && cart.deliveryTime && cart.deliveryAddress && cart.deliveryPhone);
}

/**
 * Convert cart to checkout-ready format
 */
export function cartToCheckoutData(cart: CartWithItems) {
  return {
    cartId: cart.id,
    items: cart.items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      title: item.product.title,
      variantTitle: item.variant.title,
      sku: item.variant.sku,
      quantity: item.quantity,
      price: parseFloat(item.price.toString()),
      total: parseFloat(item.price.toString()) * item.quantity,
    })),
    subtotal: parseFloat(cart.subtotal.toString()),
    discountCode: cart.discountCode,
    discountAmount: parseFloat(cart.discountAmount.toString()),
    taxAmount: parseFloat(cart.taxAmount.toString()),
    deliveryFee: parseFloat(cart.deliveryFee.toString()),
    total: parseFloat(cart.total.toString()),
    delivery: cart.deliveryAddress ? {
      date: cart.deliveryDate,
      time: cart.deliveryTime,
      address: cart.deliveryAddress,
      phone: cart.deliveryPhone,
      instructions: cart.deliveryInstructions,
    } : null,
  };
}
