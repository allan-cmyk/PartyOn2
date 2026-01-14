/**
 * Stripe Webhook Handlers
 * Note: Regular checkout handled via Shopify Shop Pay - only group payments use Stripe
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from './client';
import {
  handleGroupPaymentCompleted,
  handleGroupPaymentFailed,
  handleGroupPaymentExpired,
} from './group-payments';

const NOT_IMPLEMENTED = 'Regular checkout handled via Shopify Shop Pay - Stripe checkout not implemented';

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
 * Routes group order payments to group-payments handler
 * Regular checkouts are handled via Shopify
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('[Stripe Webhook] Processing checkout.session.completed:', session.id);

  // Check if this is a group order payment
  if (session.metadata?.isGroupOrder === 'true') {
    console.log('[Stripe Webhook] Processing group order payment:', session.id);
    await handleGroupPaymentCompleted(session);
    return;
  }

  // Regular checkout is handled via Shopify - log and skip
  console.log('[Stripe Webhook] Regular checkout session - handled via Shopify, skipping');
}

/**
 * Handle checkout.session.expired event
 * Routes group order payments to group-payments handler
 */
async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('[Stripe Webhook] Processing checkout.session.expired:', session.id);

  // Check if this is a group order payment
  if (session.metadata?.isGroupOrder === 'true') {
    console.log('[Stripe Webhook] Processing expired group order payment:', session.id);
    await handleGroupPaymentExpired(session);
    return;
  }

  // Regular checkout is handled via Shopify - log and skip
  console.log('[Stripe Webhook] Regular checkout session expired - handled via Shopify, skipping');
}

/**
 * Handle payment_intent.succeeded event
 * For group payments - logged for reference
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log('[Stripe Webhook] Processing payment_intent.succeeded:', paymentIntent.id);

  // Payment intent success is handled via checkout.session.completed
  // This is logged for reference/debugging
  console.log('[Stripe Webhook] Payment intent succeeded - processed via checkout session');
}

/**
 * Handle charge.refunded event
 * Logged for reference - manual handling may be required
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log('[Stripe Webhook] Processing charge.refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;
  const refundedAmount = charge.amount_refunded / 100; // Convert from cents

  console.log('[Stripe Webhook] Refund processed:', {
    chargeId: charge.id,
    paymentIntentId,
    refundedAmount,
    // Note: Manual reconciliation may be required for group order refunds
  });
}

/**
 * Handle payment_intent.payment_failed event
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
}

/**
 * Handle async payment failure for checkout session
 */
async function handleCheckoutSessionAsyncPaymentFailed(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('[Stripe Webhook] Processing checkout.session.async_payment_failed:', session.id);

  // Check if this is a group order payment
  if (session.metadata?.isGroupOrder === 'true') {
    console.log('[Stripe Webhook] Processing failed group order payment:', session.id);
    await handleGroupPaymentFailed(session);
    return;
  }

  // Regular checkout is handled via Shopify - log and skip
  console.log('[Stripe Webhook] Regular checkout async payment failed - handled via Shopify, skipping');
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

    case 'checkout.session.async_payment_failed':
      await handleCheckoutSessionAsyncPaymentFailed(event.data.object as Stripe.Checkout.Session);
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
  'checkout.session.async_payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
  'charge.dispute.created',
  'customer.created',
  'customer.updated',
];
