/**
 * Checkout API
 *
 * POST /api/v1/checkout - Create Stripe Checkout session
 * GET /api/v1/checkout?session_id=xxx - Get checkout session status
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCheckoutSession, getCheckoutSession, getOrCreateStripeCustomer } from '@/lib/stripe';
import { getCartById, validateCartMinimum, hasDeliveryInfo } from '@/lib/inventory/services/cart-service';
import { createFreeOrder } from '@/lib/inventory/services/order-service';

const CART_ID_COOKIE = 'cart_id';

/**
 * GET /api/v1/checkout
 * Get checkout session status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await getCheckoutSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
    });
  } catch (error) {
    console.error('[Checkout API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get checkout session',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/checkout
 * Create Stripe Checkout session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'No cart found' },
        { status: 400 }
      );
    }

    // Get the cart
    const cart = await getCartById(cartId);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Validate cart has items
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate minimum order
    const validation = validateCartMinimum(cart);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order is $${validation.minimum}. Your cart is $${validation.current.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Validate delivery info
    if (!hasDeliveryInfo(cart)) {
      return NextResponse.json(
        { success: false, error: 'Delivery information is required' },
        { status: 400 }
      );
    }

    // Get request body for optional params
    const body = await request.json().catch(() => ({}));
    const { customerEmail, customerName, customerPhone, returnUrl } = body;

    // Build success and cancel URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = returnUrl || `${appUrl}/checkout/success`;
    const cancelUrl = `${appUrl}/checkout/cancel`;

    // Handle $0 total (fully discounted orders) - Stripe can't process $0 payments
    const cartTotal = Number(cart.total);
    if (cartTotal <= 0) {
      const order = await createFreeOrder(
        cart,
        customerEmail || '',
        customerName || 'Guest',
        customerPhone || null
      );

      return NextResponse.json({
        success: true,
        data: {
          freeOrder: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
          checkoutUrl: `${successUrl}?order=${order.id}&order_name=PO-${order.orderNumber}&total=0`,
        },
      });
    }

    // Get or create Stripe customer if we have a customer ID
    let stripeCustomerId: string | undefined;
    if (cart.customerId) {
      const customerId = await getOrCreateStripeCustomer(cart.customerId);
      if (customerId) {
        stripeCustomerId = customerId;
      }
    }

    // Create checkout session
    const session = await createCheckoutSession({
      cart,
      successUrl,
      cancelUrl,
      customerEmail,
      stripeCustomerId,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error('[Checkout API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
