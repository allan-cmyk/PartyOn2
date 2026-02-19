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
import { notifyNewOrder, buildGhlPayload } from '@/lib/webhooks/ghl';
import { getAffiliateByCode } from '@/lib/affiliates/affiliate-service';
import { linkOrderToAffiliate } from '@/lib/affiliates/commission-engine';
import { prisma } from '@/lib/database/client';

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
    let cart = await getCartById(cartId);

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

    // Check for affiliate attribution cookie
    let affiliateCode: string | undefined;
    const refCode = cookieStore.get('ref_code')?.value;
    if (refCode) {
      try {
        const affiliate = await getAffiliateByCode(refCode);
        if (affiliate && affiliate.status === 'ACTIVE') {
          affiliateCode = affiliate.code;
          // Zero the delivery fee for affiliate-referred customers
          await prisma.cart.update({
            where: { id: cartId },
            data: { deliveryFee: 0 },
          });
          // Re-fetch cart with updated delivery fee
          const updatedCart = await getCartById(cartId);
          if (updatedCart) {
            // Recalculate total with $0 delivery
            const newTotal = Number(updatedCart.subtotal) - Number(updatedCart.discountAmount) + Number(updatedCart.taxAmount);
            await prisma.cart.update({
              where: { id: cartId },
              data: { total: Math.max(newTotal, 0) },
            });
            cart = (await getCartById(cartId))!;
          }
          console.log('[Checkout] Affiliate attribution applied:', affiliateCode, '- delivery fee zeroed');
        }
      } catch (err) {
        console.error('[Checkout] Error checking affiliate code:', err);
        // Non-fatal: proceed without affiliate attribution
      }
    }

    // Get request body for optional params
    const body = await request.json().catch(() => ({}));
    const { customerEmail, customerName, customerPhone, returnUrl } = body;

    // Build success and cancel URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = returnUrl || `${appUrl}/checkout/success`;
    const cancelUrl = `${appUrl}/checkout`;

    // Handle $0 total (fully discounted orders) - Stripe can't process $0 payments
    const cartTotal = Number(cart.total);
    if (cartTotal <= 0) {
      const order = await createFreeOrder(
        cart,
        customerEmail || '',
        customerName || 'Guest',
        customerPhone || null,
        affiliateCode
      );

      // Link order to affiliate and create commission if attributed
      if (affiliateCode) {
        try {
          await linkOrderToAffiliate(order, affiliateCode);
        } catch (err) {
          console.error('[Checkout] Error linking free order to affiliate:', err);
        }
      }

      // Notify GHL webhook
      await notifyNewOrder(buildGhlPayload(order, 'free'));

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
      affiliateCode,
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
