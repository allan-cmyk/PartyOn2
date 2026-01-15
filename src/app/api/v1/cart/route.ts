/**
 * Cart API - Main operations
 *
 * GET /api/v1/cart - Get current cart
 * POST /api/v1/cart - Cart operations (add, update, remove, clear)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getOrCreateCart,
  getCartById,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCartMinimum,
  cartToCheckoutData,
} from '@/lib/inventory/services/cart-service';
const CART_SESSION_COOKIE = 'cart_session_id';
const CART_ID_COOKIE = 'cart_id';

/**
 * Generate a simple UUID
 */
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get session ID from cookies or create new one
 */
async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  return sessionId || generateSessionId();
}

/**
 * GET /api/v1/cart
 * Get current cart for session or customer
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
    const sessionId = await getOrCreateSessionId();

    // Check for customer ID in header (from auth)
    const customerId = request.headers.get('x-customer-id');

    let cart;

    if (cartId) {
      // Try to get existing cart by ID
      cart = await getCartById(cartId);
    }

    if (!cart) {
      // Get or create cart for customer/session
      cart = await getOrCreateCart(customerId || undefined, sessionId);
    }

    const validation = validateCartMinimum(cart);
    const checkoutData = cartToCheckoutData(cart);

    const response = NextResponse.json({
      success: true,
      data: {
        cart,
        checkout: checkoutData,
        validation,
      },
    });

    // Set cookies
    response.cookies.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set(CART_ID_COOKIE, cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('[Cart API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cart',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/cart
 * Handle cart operations: add, update, remove, clear
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
    const sessionId = await getOrCreateSessionId();
    const customerId = request.headers.get('x-customer-id');

    const body = await request.json();
    const { operation } = body;

    // Get or create cart
    let cart;
    if (cartId) {
      cart = await getCartById(cartId);
    }
    if (!cart) {
      cart = await getOrCreateCart(customerId || undefined, sessionId);
    }

    switch (operation) {
      case 'add': {
        const { productId, variantId, quantity, price } = body;

        if (!productId || !variantId || !quantity || price === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: productId, variantId, quantity, price' },
            { status: 400 }
          );
        }

        cart = await addToCart(cart.id, { productId, variantId, quantity, price });
        break;
      }

      case 'update': {
        const { itemId, quantity } = body;

        if (!itemId || quantity === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: itemId, quantity' },
            { status: 400 }
          );
        }

        cart = await updateCartItem(cart.id, { itemId, quantity });
        break;
      }

      case 'remove': {
        const { itemId } = body;

        if (!itemId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: itemId' },
            { status: 400 }
          );
        }

        cart = await removeFromCart(cart.id, itemId);
        break;
      }

      case 'clear': {
        cart = await clearCart(cart.id);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation. Use: add, update, remove, or clear' },
          { status: 400 }
        );
    }

    const validation = validateCartMinimum(cart);
    const checkoutData = cartToCheckoutData(cart);

    const response = NextResponse.json({
      success: true,
      data: {
        cart,
        checkout: checkoutData,
        validation,
      },
    });

    // Set/refresh cookies
    response.cookies.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set(CART_ID_COOKIE, cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('[Cart API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cart operation failed',
      },
      { status: 500 }
    );
  }
}
