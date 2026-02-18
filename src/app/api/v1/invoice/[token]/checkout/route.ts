/**
 * Invoice Checkout API
 * POST: Create Stripe Checkout session for invoice payment
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { getDraftOrderByToken, updateDraftOrderStatus, canDraftOrderBePaid } from '@/lib/draft-orders';
import { DraftOrderItem } from '@/lib/draft-orders/types';
import { getTaxRateForZip, DEFAULT_TAX_RATE } from '@/lib/tax';
import { DraftOrderStatus } from '@prisma/client';
import { validateDiscountCode } from '@/lib/discounts/discount-engine';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * POST /api/v1/invoice/[token]/checkout
 * Create Stripe Checkout session for invoice payment
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // Parse optional discountCode from request body
    let discountCode: string | undefined;
    try {
      const body = await request.json();
      discountCode = body.discountCode;
    } catch {
      // No body or invalid JSON is fine -- no customer discount
    }

    // Get draft order
    const draftOrder = await getDraftOrderByToken(token);
    if (!draftOrder) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if can be paid
    const { canPay, reason } = canDraftOrderBePaid(draftOrder);
    if (!canPay) {
      return NextResponse.json(
        { success: false, error: reason },
        { status: 400 }
      );
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add product items
    for (const item of draftOrder.items as DraftOrderItem[]) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            description: item.variantTitle || undefined,
            images: item.imageUrl ? [item.imageUrl] : undefined,
            metadata: {
              productId: item.productId,
              variantId: item.variantId,
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      });
    }

    // Add delivery fee
    const deliveryFee = Number(draftOrder.deliveryFee);
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
            description: `Delivery to ${draftOrder.deliveryCity}, ${draftOrder.deliveryState}`,
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Add tax
    const taxAmount = Number(draftOrder.taxAmount);
    if (taxAmount > 0) {
      // Get tax rate for display
      const rateConfig = getTaxRateForZip(draftOrder.deliveryZip);
      const taxRate = rateConfig.rate || DEFAULT_TAX_RATE;
      const taxRateDisplay = `${(taxRate * 100).toFixed(2)}%`;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sales Tax (${taxRateDisplay})`,
            description: `${rateConfig.description} sales tax`,
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/invoice/${token}?cancelled=true`;

    // Create Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: draftOrder.customerEmail,
      metadata: {
        draftOrderId: draftOrder.id,
        draftOrderToken: draftOrder.token,
        type: 'draft_order_invoice',
        deliveryDate: draftOrder.deliveryDate.toISOString(),
        deliveryTime: draftOrder.deliveryTime,
      },
      automatic_tax: { enabled: false }, // We handle tax ourselves
      phone_number_collection: {
        enabled: true,
      },
      billing_address_collection: 'required',
    };

    // Determine which discount to apply:
    // 1. Admin baked-in discount on the draft order
    // 2. Customer-entered discount code from the request body
    // If both exist, use the larger one
    const bakedDiscount = Number(draftOrder.discountAmount);
    let finalDiscountAmount = bakedDiscount;
    let finalDiscountLabel = draftOrder.discountCode || 'Discount';

    if (discountCode && typeof discountCode === 'string') {
      // Validate the customer-entered code
      const items = (draftOrder.items as DraftOrderItem[]).map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));
      const subtotal = Number(draftOrder.subtotal);
      const result = await validateDiscountCode(discountCode, { items, subtotal });

      if (result.success && result.discountAmount > 0) {
        // Use whichever discount is larger
        if (result.discountAmount > bakedDiscount) {
          finalDiscountAmount = result.discountAmount;
          finalDiscountLabel = result.discountCode || discountCode;
        }
      }
    }

    if (finalDiscountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(finalDiscountAmount * 100),
        currency: 'usd',
        duration: 'once',
        name: finalDiscountLabel,
      });
      sessionParams.discounts = [{ coupon: coupon.id }];

      // Store applied discount in metadata so webhook can record usage
      sessionParams.metadata!.appliedDiscountCode = finalDiscountLabel;
      sessionParams.metadata!.appliedDiscountAmount = String(finalDiscountAmount);
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update draft order with checkout session ID
    await updateDraftOrderStatus(draftOrder.id, draftOrder.status as DraftOrderStatus, {
      stripeCheckoutSessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[Invoice Checkout] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
