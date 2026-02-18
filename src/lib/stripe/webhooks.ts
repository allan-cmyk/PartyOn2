/**
 * Stripe Webhook Handlers
 * Process incoming Stripe webhook events
 */

import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from './client';
import { getCheckoutSession } from './checkout';
import { prisma } from '@/lib/database/client';
import { createOrderFromCheckout, createRefund, getOrderByCheckoutSession, createOrderFromDraftOrder } from '@/lib/inventory/services/order-service';
import { getCartById } from '@/lib/inventory/services/cart-service';
import { getDraftOrderById, updateDraftOrderStatus } from '@/lib/draft-orders';
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
  sendRefundProcessedEmail,
} from '@/lib/email';
import { notifyNewOrder, buildGhlPayload } from '@/lib/webhooks/ghl';
import { recordDiscountUsage } from '@/lib/discounts/discount-engine';
import {
  handleGroupV2PaymentCompleted,
  handleGroupV2DeliveryPayment,
} from './group-v2-payments';

/**
 * Verify webhook signature and construct event
 */
export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing webhook secret');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[Stripe Webhook] Signature verification failed:', error);
    return null;
  }
}

/**
 * Handle checkout.session.completed event
 * Creates an order when payment is successful
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('[Stripe Webhook] Processing checkout.session.completed:', session.id);

  // Check if order already exists (idempotency)
  const existingOrder = await getOrderByCheckoutSession(session.id);
  if (existingOrder) {
    console.log('[Stripe Webhook] Order already exists:', existingOrder.orderNumber);
    return;
  }

  // Check if this is a draft order invoice payment
  if (session.metadata?.type === 'draft_order_invoice' && session.metadata?.draftOrderId) {
    await handleDraftOrderPayment(session);
    return;
  }

  // Check if this is a Group V2 participant checkout
  if (session.metadata?.type === 'group_v2') {
    await handleGroupV2PaymentCompleted(session);
    return;
  }

  // Check if this is a Group V2 delivery fee payment
  if (session.metadata?.type === 'group_v2_delivery') {
    await handleGroupV2DeliveryPayment(session);
    return;
  }

  // Get cart ID from metadata
  const cartId = session.metadata?.cartId;
  if (!cartId) {
    throw new Error(`[Stripe Webhook] No cartId in session metadata for session ${session.id}`);
  }

  // Retrieve the cart
  const cart = await getCartById(cartId);
  if (!cart) {
    throw new Error(`[Stripe Webhook] Cart not found: ${cartId} for session ${session.id}`);
  }

  // Retrieve full session with expanded data
  const fullSession = await getCheckoutSession(session.id);
  if (!fullSession) {
    throw new Error(`[Stripe Webhook] Failed to retrieve full session: ${session.id}`);
  }

  // Create the order
  try {
    const order = await createOrderFromCheckout(fullSession, cart);
    console.log('[Stripe Webhook] Order created:', order.orderNumber);

    // Notify GHL webhook
    await notifyNewOrder(buildGhlPayload(order, 'standard'));

    // Create delivery task
    try {
      await prisma.deliveryTask.create({
        data: {
          orderId: order.id,
          scheduledDate: order.deliveryDate,
          scheduledTime: order.deliveryTime,
          status: 'PENDING',
        },
      });
      console.log('[Stripe Webhook] Delivery task created for order:', order.orderNumber);
    } catch (deliveryError) {
      console.error('[Stripe Webhook] Failed to create delivery task:', deliveryError);
      // Don't throw - order was created successfully
    }

    // Send confirmation email
    try {
      const deliveryAddress = order.deliveryAddress as {
        address1?: string;
        address2?: string;
        city?: string;
        province?: string;
        zip?: string;
      } || {};

      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((item) => ({
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
        })),
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        discountCode: order.discountCode || undefined,
        total: Number(order.total),
        deliveryDate: order.deliveryDate,
        deliveryTime: order.deliveryTime,
        deliveryAddress: {
          address1: deliveryAddress.address1 || '',
          address2: deliveryAddress.address2,
          city: deliveryAddress.city || 'Austin',
          province: deliveryAddress.province || 'TX',
          zip: deliveryAddress.zip || '',
        },
        deliveryInstructions: order.deliveryInstructions || undefined,
      });
      console.log('[Stripe Webhook] Confirmation email sent for order:', order.orderNumber);
    } catch (emailError) {
      console.error('[Stripe Webhook] Failed to send confirmation email:', emailError);
      // Don't throw - order was created successfully
    }
  } catch (error) {
    console.error('[Stripe Webhook] Failed to create order:', error);
    throw error;
  }
}

/**
 * Handle draft order invoice payment
 * Converts draft order to real order when paid
 */
async function handleDraftOrderPayment(
  session: Stripe.Checkout.Session
): Promise<void> {
  const draftOrderId = session.metadata?.draftOrderId;
  if (!draftOrderId) {
    throw new Error(`[Stripe Webhook] No draftOrderId in session metadata for session ${session.id}`);
  }

  console.log('[Stripe Webhook] Processing draft order payment:', draftOrderId);

  // Get the draft order
  const draftOrder = await getDraftOrderById(draftOrderId);
  if (!draftOrder) {
    throw new Error(`[Stripe Webhook] Draft order not found: ${draftOrderId} for session ${session.id}`);
  }

  // Check if already processed
  if (draftOrder.status === 'PAID' || draftOrder.status === 'CONVERTED') {
    console.log('[Stripe Webhook] Draft order already processed:', draftOrderId);
    return;
  }

  try {
    // Create order from draft order
    const order = await createOrderFromDraftOrder(draftOrder, session);
    console.log('[Stripe Webhook] Order created from draft order:', order.orderNumber);

    // Notify GHL webhook
    await notifyNewOrder(buildGhlPayload(order, 'draft'));

    // Record discount usage if a discount code was applied at checkout
    const appliedDiscountCode = session.metadata?.appliedDiscountCode;
    const appliedDiscountAmount = session.metadata?.appliedDiscountAmount;
    if (appliedDiscountCode && appliedDiscountAmount) {
      try {
        const discountAmt = parseFloat(appliedDiscountAmount);
        // If customer applied a code that differs from baked-in, update the order
        if (appliedDiscountCode !== draftOrder.discountCode || discountAmt !== Number(draftOrder.discountAmount)) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              discountCode: appliedDiscountCode,
              discountAmount: discountAmt,
              total: Number(order.total) - discountAmt + Number(order.discountAmount),
            },
          });
        }
        await recordDiscountUsage(
          appliedDiscountCode,
          order.id,
          order.customerId,
          discountAmt
        );
        console.log('[Stripe Webhook] Discount usage recorded:', appliedDiscountCode, discountAmt);
      } catch (discountError) {
        console.error('[Stripe Webhook] Failed to record discount usage:', discountError);
      }
    }

    // Update draft order status
    await updateDraftOrderStatus(draftOrderId, 'CONVERTED', {
      paidAt: new Date(),
      stripePaymentIntentId: session.payment_intent as string,
      convertedOrderId: order.id,
    });
    console.log('[Stripe Webhook] Draft order marked as converted:', draftOrderId);

    // Create delivery task
    try {
      await prisma.deliveryTask.create({
        data: {
          orderId: order.id,
          scheduledDate: order.deliveryDate,
          scheduledTime: order.deliveryTime,
          status: 'PENDING',
        },
      });
      console.log('[Stripe Webhook] Delivery task created for order:', order.orderNumber);
    } catch (deliveryError) {
      console.error('[Stripe Webhook] Failed to create delivery task:', deliveryError);
    }

    // Send confirmation email
    try {
      const deliveryAddress = order.deliveryAddress as {
        address1?: string;
        address2?: string;
        city?: string;
        province?: string;
        zip?: string;
      } || {};

      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((item) => ({
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
        })),
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        discountCode: order.discountCode || undefined,
        total: Number(order.total),
        deliveryDate: order.deliveryDate,
        deliveryTime: order.deliveryTime,
        deliveryAddress: {
          address1: deliveryAddress.address1 || '',
          address2: deliveryAddress.address2,
          city: deliveryAddress.city || 'Austin',
          province: deliveryAddress.province || 'TX',
          zip: deliveryAddress.zip || '',
        },
        deliveryInstructions: order.deliveryInstructions || undefined,
      });
      console.log('[Stripe Webhook] Confirmation email sent for order:', order.orderNumber);
    } catch (emailError) {
      console.error('[Stripe Webhook] Failed to send confirmation email:', emailError);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Failed to process draft order payment:', error);
    throw error;
  }
}

/**
 * Handle checkout.session.expired event
 * Mark the cart as abandoned
 */
async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('[Stripe Webhook] Processing checkout.session.expired:', session.id);

  const cartId = session.metadata?.cartId;
  if (!cartId) return;

  try {
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        status: 'ABANDONED',
      },
    });
    console.log('[Stripe Webhook] Cart marked as abandoned:', cartId);
  } catch (error) {
    console.error('[Stripe Webhook] Failed to update cart:', error);
  }
}

/**
 * Handle payment_intent.succeeded event
 * This is a backup in case checkout.session.completed fails
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log('[Stripe Webhook] Processing payment_intent.succeeded:', paymentIntent.id);

  // Check if order already exists via checkout session
  const checkoutSessionId = paymentIntent.metadata?.checkout_session_id;
  if (checkoutSessionId) {
    const existingOrder = await getOrderByCheckoutSession(checkoutSessionId);
    if (existingOrder) {
      console.log('[Stripe Webhook] Order already exists:', existingOrder.orderNumber);
      return;
    }
  }

  // If no checkout session, log for manual review
  console.log('[Stripe Webhook] Payment succeeded without checkout session:', paymentIntent.id);
}

/**
 * Handle charge.refunded event
 * Process refunds and update order status
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log('[Stripe Webhook] Processing charge.refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    console.error('[Stripe Webhook] No payment_intent on charge');
    return;
  }

  // Find order by payment intent
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!order) {
    console.error('[Stripe Webhook] Order not found for payment intent:', paymentIntentId);
    return;
  }

  // Calculate refund amount
  const refundedAmount = charge.amount_refunded / 100; // Convert from cents

  try {
    await createRefund(order.id, refundedAmount, 'Stripe refund');
    console.log('[Stripe Webhook] Refund processed for order:', order.orderNumber);

    // Send refund notification email
    try {
      // Get customer info from order
      const orderWithCustomer = await prisma.order.findUnique({
        where: { id: order.id },
        include: { customer: true },
      });

      if (orderWithCustomer?.customerEmail) {
        await sendRefundProcessedEmail(
          orderWithCustomer.customerEmail,
          orderWithCustomer.customerName,
          orderWithCustomer.orderNumber,
          refundedAmount,
          'Stripe refund'
        );
        console.log('[Stripe Webhook] Refund email sent for order:', order.orderNumber);
      }
    } catch (emailError) {
      console.error('[Stripe Webhook] Failed to send refund email:', emailError);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Failed to process refund:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Log failed payments and notify customer
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log('[Stripe Webhook] Processing payment_intent.payment_failed:', paymentIntent.id);

  const error = paymentIntent.last_payment_error;
  console.error('[Stripe Webhook] Payment failed:', {
    paymentIntentId: paymentIntent.id,
    errorCode: error?.code,
    errorMessage: error?.message,
    customerEmail: paymentIntent.receipt_email,
  });

  // Send payment failure notification
  const customerEmail = paymentIntent.receipt_email;
  if (customerEmail) {
    try {
      // Get customer name from metadata or use generic
      const customerName = paymentIntent.metadata?.customerName || 'Valued Customer';
      const errorMessage = error?.message || 'Your payment could not be processed.';

      await sendPaymentFailedEmail(customerEmail, customerName, errorMessage);
      console.log('[Stripe Webhook] Payment failure email sent to:', customerEmail);
    } catch (emailError) {
      console.error('[Stripe Webhook] Failed to send payment failure email:', emailError);
    }
  }
}

/**
 * Main webhook event processor
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
      break;

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      console.log('[Stripe Webhook] Unhandled event type:', event.type);
  }
}

/**
 * List of webhook events to subscribe to
 */
export const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
  'charge.dispute.created',
  'customer.created',
  'customer.updated',
];
