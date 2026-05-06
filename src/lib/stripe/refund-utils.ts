/**
 * Refund cap helpers — source of truth is the Stripe charge, not Order.total.
 * Order.total can be mutated by OrderAmendment when items are added/removed,
 * so it cannot be used to cap refunds.
 */

import { stripe } from './client';

/**
 * Returns the amount actually captured by Stripe for a PaymentIntent, in dollars.
 */
export async function getStripeCapturedAmount(paymentIntentId: string): Promise<number> {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  return pi.amount_received / 100;
}

/**
 * Returns the maximum amount that can still be refunded against a PaymentIntent.
 * = (Stripe-captured) − (sum of prior refund amounts in dollars).
 */
export async function getMaxRefundable(
  paymentIntentId: string,
  priorRefundsTotalDollars: number
): Promise<number> {
  const captured = await getStripeCapturedAmount(paymentIntentId);
  return Math.round((captured - priorRefundsTotalDollars) * 100) / 100;
}
