/**
 * Cart Discount API
 *
 * POST /api/v1/cart/discount - Apply discount code
 * DELETE /api/v1/cart/discount - Remove discount code(s)
 * PUT /api/v1/cart/discount - Get automatic discounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getCartById,
  addDiscount,
  removeDiscount,
  removeAllDiscounts,
} from '@/lib/inventory/services/cart-service';
import {
  validateDiscountCombination,
  getAutomaticDiscounts,
} from '@/lib/discounts/discount-engine';
import type { AppliedDiscountEntry } from '@/lib/discounts/discount-engine';

const CART_ID_COOKIE = 'cart_id';

/** Serialize a cart for JSON responses (convert Prisma Decimals to strings) */
function serializeCart(cart: Awaited<ReturnType<typeof getCartById>>) {
  if (!cart) return null;
  return {
    ...cart,
    subtotal: cart.subtotal.toString(),
    taxAmount: cart.taxAmount.toString(),
    deliveryFee: cart.deliveryFee.toString(),
    discountAmount: cart.discountAmount.toString(),
    total: cart.total.toString(),
    appliedDiscounts: (cart.appliedDiscounts as unknown as AppliedDiscountEntry[]) || [],
    items: cart.items.map(item => ({
      ...item,
      price: item.price.toString(),
      variant: {
        ...item.variant,
        price: item.variant.price.toString(),
      },
    })),
  };
}

/**
 * POST /api/v1/cart/discount
 * Apply discount code to cart (supports multiple combinable codes)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'No cart found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { code, customerId, isFirstOrder } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Discount code is required' },
        { status: 400 }
      );
    }

    // Get current cart
    const cart = await getCartById(cartId);
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Build cart context for discount validation
    const cartItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const subtotal = Number(cart.subtotal);
    const existingDiscounts = (cart.appliedDiscounts as unknown as AppliedDiscountEntry[]) || [];

    // Validate discount code with combination logic
    const result = await validateDiscountCombination(code, existingDiscounts, {
      items: cartItems,
      subtotal,
      customerId,
      isFirstOrder,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Add discount to cart
    const updatedCart = await addDiscount(
      cartId,
      result.discountCode!,
      result.discountAmount,
      result.discountType!,
      result.freeShipping
    );

    return NextResponse.json({
      success: true,
      data: {
        cart: serializeCart(updatedCart),
        discount: {
          code: result.discountCode,
          type: result.discountType,
          amount: result.discountAmount,
        },
      },
      message: result.message,
    });
  } catch (error) {
    console.error('[Cart Discount API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply discount',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/cart/discount
 * Remove discount code(s) from cart
 * Query param ?code=CODE removes a specific code; omit to remove all
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'No cart found' },
        { status: 404 }
      );
    }

    const cart = await getCartById(cartId);
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const existingDiscounts = (cart.appliedDiscounts as unknown as AppliedDiscountEntry[]) || [];

    // If no discounts applied at all (check both old field and new array)
    if (!cart.discountCode && existingDiscounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No discount code applied' },
        { status: 400 }
      );
    }

    const codeToRemove = request.nextUrl.searchParams.get('code');

    let updatedCart;
    if (codeToRemove) {
      updatedCart = await removeDiscount(cartId, codeToRemove);
    } else {
      updatedCart = await removeAllDiscounts(cartId);
    }

    return NextResponse.json({
      success: true,
      data: { cart: serializeCart(updatedCart) },
      message: codeToRemove ? `Discount "${codeToRemove}" removed` : 'All discounts removed',
    });
  } catch (error) {
    console.error('[Cart Discount API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove discount',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/cart/discount
 * Get automatic discounts for cart
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'No cart found' },
        { status: 404 }
      );
    }

    const cart = await getCartById(cartId);
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { customerId, isFirstOrder } = body;

    // Build cart context
    const cartItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const subtotal = Number(cart.subtotal);

    // Get automatic discounts
    const automaticDiscounts = await getAutomaticDiscounts({
      items: cartItems,
      subtotal,
      customerId,
      isFirstOrder,
    });

    const totalAutoDiscount = automaticDiscounts.reduce(
      (sum, d) => sum + d.amount,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        automaticDiscounts,
        totalAutomaticDiscount: totalAutoDiscount,
      },
    });
  } catch (error) {
    console.error('[Cart Discount API] PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get automatic discounts',
      },
      { status: 500 }
    );
  }
}
