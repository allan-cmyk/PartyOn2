/**
 * Order Service
 * Note: Order models not in Prisma schema - orders managed via Shopify
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type Stripe from 'stripe';
import { CartWithItems } from './cart-service';

// Local type definitions since Prisma models don't exist
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type FulfillmentStatus = 'UNFULFILLED' | 'PARTIALLY_FULFILLED' | 'FULFILLED';
type FinancialStatus = 'PENDING' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

const NOT_IMPLEMENTED = 'Orders managed via Shopify - local order service not implemented';

/**
 * Order with all relations
 */
export interface OrderWithItems {
  id: string;
  orderNumber: number;
  customerId: string;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  financialStatus: FinancialStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountCode: string | null;
  discountAmount: number;
  total: number;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress: unknown;
  deliveryPhone: string;
  deliveryInstructions: string | null;
  customerEmail: string;
  customerPhone: string | null;
  customerName: string;
  items: OrderItemWithProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemWithProduct {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
}

/**
 * Create an order from a completed Stripe checkout session (stub)
 */
export async function createOrderFromCheckout(
  _session: Stripe.Checkout.Session,
  _cart: CartWithItems
): Promise<OrderWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Get an order by ID (stub)
 */
export async function getOrderById(_orderId: string): Promise<OrderWithItems | null> {
  return null;
}

/**
 * Get an order by order number (stub)
 */
export async function getOrderByNumber(_orderNumber: number): Promise<OrderWithItems | null> {
  return null;
}

/**
 * Get an order by Stripe checkout session ID (stub)
 */
export async function getOrderByCheckoutSession(
  _sessionId: string
): Promise<OrderWithItems | null> {
  return null;
}

/**
 * Get orders for a customer (stub)
 */
export async function getCustomerOrders(
  _customerId: string,
  _options: { page?: number; pageSize?: number } = {}
): Promise<{ orders: OrderWithItems[]; total: number }> {
  return { orders: [], total: 0 };
}

/**
 * Update order status (stub)
 */
export async function updateOrderStatus(
  _orderId: string,
  _status: OrderStatus
): Promise<OrderWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Update fulfillment status (stub)
 */
export async function updateFulfillmentStatus(
  _orderId: string,
  _fulfillmentStatus: FulfillmentStatus
): Promise<OrderWithItems> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Create a refund for an order (stub)
 */
export async function createRefund(
  _orderId: string,
  _amount: number,
  _reason?: string
): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Get all orders with filtering (stub)
 */
export async function getOrders(_options: {
  status?: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
  financialStatus?: FinancialStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}): Promise<{ orders: OrderWithItems[]; total: number }> {
  return { orders: [], total: 0 };
}
