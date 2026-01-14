/**
 * Stripe Checkout Service
 * Note: Checkout managed via Shopify Shop Pay - local Stripe checkout not implemented
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import Stripe from 'stripe';
import { CartWithItems } from '@/lib/inventory/services/cart-service';

const NOT_IMPLEMENTED = 'Checkout managed via Shopify Shop Pay - local Stripe checkout not implemented';

/**
 * Checkout session metadata stored with Stripe
 */
export interface CheckoutMetadata {
  cartId: string;
  customerId?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryInstructions?: string;
  isExpress?: string;
  discountCode?: string;
}

/**
 * Line item for checkout
 */
export interface CheckoutLineItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: number; // in cents
  imageUrl?: string;
}

/**
 * Options for creating a checkout session
 */
export interface CreateCheckoutOptions {
  cart: CartWithItems;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  stripeCustomerId?: string;
}

/**
 * Create a Stripe Checkout session from a cart (stub)
 */
export async function createCheckoutSession(
  _options: CreateCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Retrieve a checkout session by ID (stub)
 */
export async function getCheckoutSession(
  _sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  return null;
}

/**
 * Expire a checkout session (stub)
 */
export async function expireCheckoutSession(_sessionId: string): Promise<boolean> {
  return false;
}

/**
 * Get or create a Stripe customer (stub)
 */
export async function getOrCreateStripeCustomer(
  _customerId: string
): Promise<string | null> {
  return null;
}
