/**
 * Stripe Client Configuration
 * Server-side Stripe SDK initialization
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

/**
 * Stripe client instance for server-side operations
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

/**
 * Stripe publishable key for client-side operations
 */
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Stripe webhook secret for signature verification
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
