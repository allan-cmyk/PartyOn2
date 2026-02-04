/**
 * Cart Discount API
 *
 * POST /api/v1/cart/discount - Apply discount code
 * DELETE /api/v1/cart/discount - Remove discount code
 * PUT /api/v1/cart/discount - Get automatic discounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getCartById,
  applyDiscount,
  removeDiscount,
} from '@/lib/inventory/services/cart-service';
import {
  validateDiscountCode,
  getAutomaticDiscounts,
} from '@/lib/discounts/discount-engine';

const CART_ID_COOKIE = 'cart_id';

/**
 * POST /api/v1/cart/discount
 * Apply discount code to cart
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

    // Check if cart already has a discount
    if (cart.discountCode) {
      return NextResponse.json(
        { success: false, error: 'A discount code is already applied. Remove it first.' },
        { status: 400 }
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

    // Validate discount code using the discount engine
    const result = await validateDiscountCode(code, {
      items: cartItems,
      subtotal,
      customerId,
      isFirstOrder,
    });

    console.log('[Discount API] validateDiscountCode result:', {
      success: result.success,
      discountCode: result.discountCode,
      discountType: result.discountType,
      discountAmount: result.discountAmount,
      error: result.error,
      message: result.message,
      subtotal,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Apply discount to cart
    const updatedCart = await applyDiscount(
      cartId,
      result.discountCode!,
      result.discountAmount
    );

    console.log('[Discount API] applyDiscount result:', {
      cartId: updatedCart.id,
      discountCode: updatedCart.discountCode,
      discountAmount: updatedCart.discountAmount?.toString(),
      subtotal: updatedCart.subtotal?.toString(),
      total: updatedCart.total?.toString(),
    });

    // Serialize cart with proper decimal conversion for JSON
    const serializedCart = {
      ...updatedCart,
      subtotal: updatedCart.subtotal.toString(),
      taxAmount: updatedCart.taxAmount.toString(),
      deliveryFee: updatedCart.deliveryFee.toString(),
      discountAmount: updatedCart.discountAmount.toString(),
      total: updatedCart.total.toString(),
      items: updatedCart.items.map(item => ({
        ...item,
        price: item.price.toString(),
        variant: {
          ...item.variant,
          price: item.variant.price.toString(),
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        cart: serializedCart,
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
 * Remove discount code from cart
 */
export async function DELETE(): Promise<NextResponse> {
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

    if (!cart.discountCode) {
      return NextResponse.json(
        { success: false, error: 'No discount code applied' },
        { status: 400 }
      );
    }

    const updatedCart = await removeDiscount(cartId);

    // Serialize cart with proper decimal conversion for JSON
    const serializedCart = {
      ...updatedCart,
      subtotal: updatedCart.subtotal.toString(),
      taxAmount: updatedCart.taxAmount.toString(),
      deliveryFee: updatedCart.deliveryFee.toString(),
      discountAmount: updatedCart.discountAmount.toString(),
      total: updatedCart.total.toString(),
      items: updatedCart.items.map(item => ({
        ...item,
        price: item.price.toString(),
        variant: {
          ...item.variant,
          price: item.variant.price.toString(),
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: { cart: serializedCart },
      message: 'Discount removed',
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
