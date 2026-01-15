/**
 * Stripe Checkout Service
 * Handles creating and managing Stripe Checkout sessions
 */

import Stripe from 'stripe';
import { stripe } from './client';
import { CartWithItems } from '@/lib/inventory/services/cart-service';
import { prisma } from '@/lib/database/client'; // Used for getOrCreateStripeCustomer

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
 * Create a Stripe Checkout session from a cart
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const { cart, successUrl, cancelUrl, customerEmail, stripeCustomerId } = options;

  // Build line items from cart
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.title,
        description: item.variant.title !== 'Default Title' ? item.variant.title : undefined,
        metadata: {
          productId: item.productId,
          variantId: item.variantId,
          sku: item.variant.sku || '',
        },
      },
      unit_amount: Math.round(Number(item.price) * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));

  // Add delivery fee as a line item
  const deliveryFee = Number(cart.deliveryFee);
  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: cart.deliveryDate ? 'Scheduled Delivery' : 'Express Delivery',
          description: cart.deliveryDate
            ? `Delivery on ${cart.deliveryDate} at ${cart.deliveryTime || 'Scheduled time'}`
            : '3-hour express delivery',
        },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });
  }

  // Build metadata for the session (filter out undefined values)
  const rawMetadata: CheckoutMetadata = {
    cartId: cart.id,
    customerId: cart.customerId || undefined,
    deliveryDate: cart.deliveryDate ? cart.deliveryDate.toISOString() : undefined,
    deliveryTime: cart.deliveryTime || undefined,
    deliveryAddress: cart.deliveryAddress ? JSON.stringify(cart.deliveryAddress) : undefined,
    deliveryPhone: cart.deliveryPhone || undefined,
    deliveryInstructions: cart.deliveryInstructions || undefined,
    discountCode: cart.discountCode || undefined,
  };

  // Filter out undefined values for Stripe metadata
  const metadata: Record<string, string> = Object.fromEntries(
    Object.entries(rawMetadata).filter(([, v]) => v !== undefined)
  ) as Record<string, string>;

  // Create checkout session params
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card', 'link'],
    line_items: lineItems,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata,
    automatic_tax: { enabled: false }, // We handle tax ourselves
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    phone_number_collection: {
      enabled: true,
    },
    billing_address_collection: 'required',
    custom_text: {
      shipping_address: {
        message: 'Please enter your delivery address for alcohol delivery.',
      },
    },
  };

  // Add customer info if available
  if (stripeCustomerId) {
    sessionParams.customer = stripeCustomerId;
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Apply discounts if any
  if (cart.discountCode && Number(cart.discountAmount) > 0) {
    // Create a coupon for this discount
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(Number(cart.discountAmount) * 100),
      currency: 'usd',
      duration: 'once',
      name: cart.discountCode,
    });
    sessionParams.discounts = [{ coupon: coupon.id }];
  }

  // Add tax line item
  const taxAmount = Number(cart.taxAmount);
  if (taxAmount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Sales Tax (8.25%)',
          description: 'Texas state and local sales tax',
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });
  }

  // Create the session
  const session = await stripe.checkout.sessions.create(sessionParams);

  // Note: We store session ID in Stripe metadata, not in cart
  // The order service will link the checkout session when order is created

  return session;
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'customer'],
    });
  } catch (error) {
    console.error('[Stripe] Failed to retrieve checkout session:', error);
    return null;
  }
}

/**
 * Expire a checkout session (cancel it)
 */
export async function expireCheckoutSession(sessionId: string): Promise<boolean> {
  try {
    await stripe.checkout.sessions.expire(sessionId);
    return true;
  } catch (error) {
    console.error('[Stripe] Failed to expire checkout session:', error);
    return false;
  }
}

/**
 * Get or create a Stripe customer
 */
export async function getOrCreateStripeCustomer(
  customerId: string
): Promise<string | null> {
  try {
    // Check if customer already has a Stripe customer ID
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) return null;

    if (customer.stripeCustomerId) {
      return customer.stripeCustomerId;
    }

    // Create a new Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: customer.email,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || undefined,
      phone: customer.phone || undefined,
      metadata: {
        customerId: customer.id,
      },
    });

    // Save the Stripe customer ID
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        stripeCustomerId: stripeCustomer.id,
      },
    });

    return stripeCustomer.id;
  } catch (error) {
    console.error('[Stripe] Failed to get/create customer:', error);
    return null;
  }
}
