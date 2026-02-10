/**
 * Stripe Client Configuration
 * Server-side Stripe SDK initialization with lazy loading
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/**
 * Get Stripe client instance (lazy initialization)
 * Only creates the client when actually needed, preventing build-time errors
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Stripe client instance for server-side operations
 * @deprecated Use getStripe() for lazy initialization
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

/**
 * Stripe publishable key for client-side operations
 */
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Stripe webhook secret for signature verification
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
