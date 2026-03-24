/**
 * Order Service
 * Handles order creation, management, and fulfillment
 */

import { prisma } from '@/lib/database/client';
import { Prisma, OrderStatus, FulfillmentStatus, FinancialStatus } from '@prisma/client';
import type Stripe from 'stripe';
import { CartWithItems } from './cart-service';
import type { DraftOrderWithTotal, DraftOrderItem } from '@/lib/draft-orders/types';

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
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  deliveryFee: Prisma.Decimal;
  discountCode: string | null;
  discountAmount: Prisma.Decimal;
  total: Prisma.Decimal;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress: Prisma.JsonValue;
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
  price: Prisma.Decimal;
  totalPrice: Prisma.Decimal;
}

/**
 * Shared helper: decrement inventory for a single order item.
 * If the product is a bundle, decrements each component's inventory instead.
 */
type TransactionClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

async function decrementInventoryForOrderItem(
  tx: TransactionClient,
  productId: string,
  variantId: string,
  orderQuantity: number,
  orderNumber: number,
  orderId: string,
): Promise<void> {
  // Check if this product is a bundle
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      isBundle: true,
      bundleComponents: {
        select: {
          componentProductId: true,
          componentVariantId: true,
          quantity: true,
        },
      },
    },
  });

  if (product?.isBundle && product.bundleComponents.length > 0) {
    // Bundle: decrement each component's inventory
    for (const component of product.bundleComponents) {
      const componentVariantId = component.componentVariantId;
      const decrementQty = component.quantity * orderQuantity;

      const inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          productId: component.componentProductId,
          ...(componentVariantId ? { variantId: componentVariantId } : {}),
        },
      });

      if (inventoryItem) {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: decrementQty } },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: 'SOLD',
            quantity: -decrementQty,
            previousQuantity: inventoryItem.quantity,
            newQuantity: inventoryItem.quantity - decrementQty,
            reason: `Order #${orderNumber} (bundle component)`,
            referenceId: orderId,
            referenceType: 'Order',
          },
        });
      }
    }
  } else {
    // Regular product: decrement directly
    const inventoryItem = await tx.inventoryItem.findFirst({
      where: { productId, variantId },
    });

    if (inventoryItem) {
      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: { decrement: orderQuantity } },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          type: 'SOLD',
          quantity: -orderQuantity,
          previousQuantity: inventoryItem.quantity,
          newQuantity: inventoryItem.quantity - orderQuantity,
          reason: `Order #${orderNumber}`,
          referenceId: orderId,
          referenceType: 'Order',
        },
      });
    }
  }
}

/**
 * Create an order from a completed Stripe checkout session
 */
export async function createOrderFromCheckout(
  session: Stripe.Checkout.Session,
  cart: CartWithItems
): Promise<OrderWithItems> {
  // Extract customer info from session
  const customerEmail = session.customer_details?.email || '';
  const customerPhone = session.customer_details?.phone || null;
  const customerName = session.customer_details?.name || 'Guest';

  // Get shipping details from session or cart
  let deliveryAddress = cart.deliveryAddress;
  let deliveryPhone = cart.deliveryPhone || '';

  // Type assertion for shipping details (Stripe expanded session)
  const shippingDetails = (session as { shipping_details?: { address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }; phone?: string } }).shipping_details;

  if (shippingDetails?.address) {
    deliveryAddress = {
      address1: shippingDetails.address.line1 || '',
      address2: shippingDetails.address.line2 || '',
      city: shippingDetails.address.city || '',
      province: shippingDetails.address.state || 'TX',
      zip: shippingDetails.address.postal_code || '',
      country: shippingDetails.address.country || 'US',
    };
  }

  if (shippingDetails?.phone) {
    deliveryPhone = shippingDetails.phone;
  }

  // Get or create customer ID
  let customerId = cart.customerId;

  if (!customerId && customerEmail) {
    // Create or find customer from Stripe session data (guest checkout)
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer from checkout info
      const nameParts = customerName.split(' ');
      const newCustomer = await prisma.customer.create({
        data: {
          email: customerEmail,
          phone: customerPhone,
          firstName: nameParts[0] || 'Guest',
          lastName: nameParts.slice(1).join(' ') || '',
          ageVerified: true, // They completed checkout with age verification
          isActive: true,
        }
      });
      customerId = newCustomer.id;
    }
  }

  // Validate required fields
  if (!customerId) {
    throw new Error('Customer ID is required to create an order');
  }
  if (!cart.deliveryDate) {
    throw new Error('Delivery date is required to create an order');
  }
  if (!cart.deliveryTime) {
    throw new Error('Delivery time is required to create an order');
  }

  // Extract payment intent ID (can be string or expanded object)
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || null;

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx: TransactionClient) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        customerId: customerId!,
        stripePaymentIntentId: paymentIntentId,
        stripeCheckoutSessionId: session.id,
        status: 'CONFIRMED',
        fulfillmentStatus: 'UNFULFILLED',
        financialStatus: 'PAID',
        subtotal: cart.subtotal,
        taxAmount: cart.taxAmount,
        deliveryFee: cart.deliveryFee,
        discountCode: cart.discountCode,
        discountAmount: cart.discountAmount,
        tipAmount: session.metadata?.tipAmount ? parseFloat(session.metadata.tipAmount) : 0,
        total: cart.total,
        deliveryDate: (() => { const d = new Date(cart.deliveryDate!); d.setUTCHours(12, 0, 0, 0); return d; })(),
        deliveryTime: cart.deliveryTime!,
        deliveryAddress: deliveryAddress ?? Prisma.JsonNull,
        deliveryPhone: deliveryPhone || customerPhone || '',
        deliveryInstructions: cart.deliveryInstructions,
        customerEmail,
        customerPhone,
        customerName,
      },
      include: { items: true },
    });

    // Create order items
    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          title: item.product.title,
          variantTitle: item.variant.title,
          sku: item.variant.sku,
          quantity: item.quantity,
          price: item.price,
          totalPrice: new Prisma.Decimal(Number(item.price) * item.quantity),
        },
      });
    }

    // Decrement inventory for each item (handles bundles automatically)
    for (const item of cart.items) {
      await decrementInventoryForOrderItem(tx, item.productId, item.variantId, item.quantity, newOrder.orderNumber, newOrder.id);
    }

    // Get the order with items
    const orderWithItems = await tx.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true },
    });

    return orderWithItems;
  });

  if (!order) {
    throw new Error('Failed to create order');
  }

  // Update cart status
  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      status: 'CONVERTED',
    },
  });

  return order as unknown as OrderWithItems;
}

/**
 * Create an order from a cart with $0 total (fully discounted)
 * Used when discounts cover the entire order, skipping Stripe
 */
export async function createFreeOrder(
  cart: CartWithItems,
  customerEmail: string,
  customerName: string,
  customerPhone: string | null,
  affiliateCode?: string,
  overrideDeliveryFee?: number,
  overrideTotal?: number
): Promise<OrderWithItems> {
  // Get or create customer
  let customerId = cart.customerId;

  if (!customerId && customerEmail) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: customerEmail },
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const nameParts = customerName.split(' ');
      const newCustomer = await prisma.customer.create({
        data: {
          email: customerEmail,
          phone: customerPhone,
          firstName: nameParts[0] || 'Guest',
          lastName: nameParts.slice(1).join(' ') || '',
          ageVerified: true,
          isActive: true,
        },
      });
      customerId = newCustomer.id;
    }
  }

  if (!customerId) {
    throw new Error('Customer ID is required to create an order');
  }
  if (!cart.deliveryDate) {
    throw new Error('Delivery date is required to create an order');
  }
  if (!cart.deliveryTime) {
    throw new Error('Delivery time is required to create an order');
  }

  // Look up affiliate ID if code provided
  let affiliateId: string | undefined;
  if (affiliateCode) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { code: affiliateCode.toUpperCase() },
    });
    if (affiliate && affiliate.status === 'ACTIVE') {
      affiliateId = affiliate.id;
    }
  }

  const order = await prisma.$transaction(async (tx: TransactionClient) => {
    const newOrder = await tx.order.create({
      data: {
        customerId: customerId!,
        stripePaymentIntentId: null,
        stripeCheckoutSessionId: null,
        status: 'CONFIRMED',
        fulfillmentStatus: 'UNFULFILLED',
        financialStatus: 'PAID',
        subtotal: cart.subtotal,
        taxAmount: cart.taxAmount,
        deliveryFee: overrideDeliveryFee !== undefined ? overrideDeliveryFee : cart.deliveryFee,
        discountCode: cart.discountCode,
        discountAmount: cart.discountAmount,
        total: overrideTotal !== undefined ? Math.max(overrideTotal, 0) : cart.total,
        deliveryDate: (() => { const d = new Date(cart.deliveryDate!); d.setUTCHours(12, 0, 0, 0); return d; })(),
        deliveryTime: cart.deliveryTime!,
        deliveryAddress: cart.deliveryAddress ?? Prisma.JsonNull,
        deliveryPhone: cart.deliveryPhone || customerPhone || '',
        deliveryInstructions: cart.deliveryInstructions,
        customerEmail,
        customerPhone,
        customerName,
        affiliateId: affiliateId || undefined,
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          title: item.product.title,
          variantTitle: item.variant.title,
          sku: item.variant.sku,
          quantity: item.quantity,
          price: item.price,
          totalPrice: new Prisma.Decimal(Number(item.price) * item.quantity),
        },
      });
    }

    // Decrement inventory (handles bundles automatically)
    for (const item of cart.items) {
      await decrementInventoryForOrderItem(tx, item.productId, item.variantId, item.quantity, newOrder.orderNumber, newOrder.id);
    }

    return await tx.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true },
    });
  });

  if (!order) {
    throw new Error('Failed to create free order');
  }

  // Mark cart as converted
  await prisma.cart.update({
    where: { id: cart.id },
    data: { status: 'CONVERTED' },
  });

  return order as unknown as OrderWithItems;
}

/**
 * Get an order by ID
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  return order as unknown as OrderWithItems | null;
}

/**
 * Get an order by order number
 */
export async function getOrderByNumber(orderNumber: number): Promise<OrderWithItems | null> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  return order as unknown as OrderWithItems | null;
}

/**
 * Get an order by Stripe checkout session ID
 */
export async function getOrderByCheckoutSession(
  sessionId: string
): Promise<OrderWithItems | null> {
  const order = await prisma.order.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    include: { items: true },
  });

  return order as unknown as OrderWithItems | null;
}

/**
 * Get orders for a customer
 */
export async function getCustomerOrders(
  customerId: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<{ orders: OrderWithItems[]; total: number }> {
  const { page = 1, pageSize = 10 } = options;
  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { customerId } }),
  ]);

  return { orders: orders as unknown as OrderWithItems[], total };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderWithItems> {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  });

  return order as unknown as OrderWithItems;
}

/**
 * Update fulfillment status
 */
export async function updateFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus
): Promise<OrderWithItems> {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { fulfillmentStatus },
    include: { items: true },
  });

  return order as unknown as OrderWithItems;
}

/**
 * Create a refund for an order
 */
export async function createRefund(
  orderId: string,
  amount: number,
  reason?: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Create refund record
  await prisma.refund.create({
    data: {
      orderId,
      amount: new Prisma.Decimal(amount),
      reason: reason || 'Customer request',
      status: 'SUCCEEDED',
    },
  });

  // Update order financial status based on total refunds
  const totalRefunds = await prisma.refund.aggregate({
    where: { orderId },
    _sum: { amount: true },
  });

  const totalRefunded = Number(totalRefunds._sum.amount || 0);
  const orderTotal = Number(order.total);

  if (totalRefunded >= orderTotal) {
    await prisma.order.update({
      where: { id: orderId },
      data: { financialStatus: 'REFUNDED' },
    });
  } else if (totalRefunded > 0) {
    await prisma.order.update({
      where: { id: orderId },
      data: { financialStatus: 'PARTIALLY_REFUNDED' },
    });
  }
}

/**
 * Get all orders with filtering
 */
export async function getOrders(options: {
  status?: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
  financialStatus?: FinancialStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}): Promise<{ orders: OrderWithItems[]; total: number }> {
  const {
    status,
    fulfillmentStatus,
    financialStatus,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
  } = options;

  const skip = (page - 1) * pageSize;

  const where: Prisma.OrderWhereInput = {};

  if (status) where.status = status;
  if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;
  if (financialStatus) where.financialStatus = financialStatus;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: orders as unknown as OrderWithItems[], total };
}

/**
 * Create an order from a paid draft order (invoice)
 */
export async function createOrderFromDraftOrder(
  draftOrder: DraftOrderWithTotal,
  session: Stripe.Checkout.Session
): Promise<OrderWithItems> {
  // Extract customer info from session (or fallback to draft order)
  const customerEmail = session.customer_details?.email || draftOrder.customerEmail;
  const customerPhone = session.customer_details?.phone || draftOrder.customerPhone || null;
  const customerName = session.customer_details?.name || draftOrder.customerName;

  // Build delivery address object
  const deliveryAddress = {
    address1: draftOrder.deliveryAddress,
    address2: '',
    city: draftOrder.deliveryCity,
    province: draftOrder.deliveryState,
    zip: draftOrder.deliveryZip,
    country: 'US',
  };

  // Get or create customer ID
  let customerId: string | null = null;

  if (customerEmail) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer from invoice info
      const nameParts = customerName.split(' ');
      const newCustomer = await prisma.customer.create({
        data: {
          email: customerEmail,
          phone: customerPhone,
          firstName: nameParts[0] || 'Guest',
          lastName: nameParts.slice(1).join(' ') || '',
          ageVerified: true, // They completed checkout
          isActive: true,
        }
      });
      customerId = newCustomer.id;
    }
  }

  if (!customerId) {
    throw new Error('Customer ID is required to create an order');
  }

  // Extract payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || null;

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx: TransactionClient) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        customerId,
        stripePaymentIntentId: paymentIntentId,
        stripeCheckoutSessionId: session.id,
        status: 'CONFIRMED',
        fulfillmentStatus: 'UNFULFILLED',
        financialStatus: 'PAID',
        subtotal: draftOrder.subtotal,
        taxAmount: draftOrder.taxAmount,
        deliveryFee: draftOrder.deliveryFee,
        discountCode: draftOrder.discountCode,
        discountAmount: draftOrder.discountAmount,
        total: draftOrder.total,
        deliveryDate: (() => { const d = new Date(draftOrder.deliveryDate); d.setUTCHours(12, 0, 0, 0); return d; })(),
        deliveryTime: draftOrder.deliveryTime,
        deliveryAddress: deliveryAddress,
        deliveryPhone: draftOrder.customerPhone || customerPhone || '',
        deliveryInstructions: draftOrder.deliveryNotes,
        customerEmail,
        customerPhone,
        customerName,
        groupOrderId: draftOrder.groupOrderId,
      },
      include: { items: true },
    });

    // Create order items (handle custom items that may not have real product/variant IDs)
    const items = draftOrder.items as DraftOrderItem[];
    for (const item of items) {
      const productId = item.productId;
      let variantId = item.variantId;

      // Check if product exists; create placeholder if not (for custom draft order items)
      const productExists = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
      if (!productExists) {
        await tx.product.create({
          data: {
            id: productId,
            title: item.title,
            handle: productId,
            description: 'Custom item (added via draft order)',
            status: 'DRAFT',
            productType: 'Custom',
            vendor: 'Custom',
            basePrice: new Prisma.Decimal(item.price),
          },
        });
        console.log(`[Order Service] Created placeholder product for custom item: ${item.title}`);
      }

      // Check if variant exists; create or find one if not
      const variantExists = await tx.productVariant.findUnique({ where: { id: variantId }, select: { id: true } });
      if (!variantExists) {
        const existingVariant = await tx.productVariant.findFirst({ where: { productId }, select: { id: true } });
        if (existingVariant) {
          variantId = existingVariant.id;
        } else {
          const newVariant = await tx.productVariant.create({
            data: {
              productId,
              title: item.variantTitle || 'Default Title',
              price: new Prisma.Decimal(item.price),
              inventoryQuantity: 0,
              availableForSale: false,
            },
          });
          variantId = newVariant.id;
        }
      }

      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId,
          variantId,
          title: item.title,
          variantTitle: item.variantTitle || null,
          sku: null,
          quantity: item.quantity,
          price: new Prisma.Decimal(item.price),
          totalPrice: new Prisma.Decimal(item.price * item.quantity),
        },
      });
    }

    // Decrement inventory for each item (handles bundles automatically, skips missing products)
    for (const item of items) {
      try {
        await decrementInventoryForOrderItem(tx, item.productId, item.variantId, item.quantity, newOrder.orderNumber, newOrder.id);
      } catch (inventoryError) {
        // Custom items may not have inventory tracking - log and continue
        console.warn(`[Order Service] Could not decrement inventory for ${item.title}:`, inventoryError);
      }
    }

    // Get the order with items
    const orderWithItems = await tx.order.findUnique({
      where: { id: newOrder.id },
      include: { items: true },
    });

    return orderWithItems;
  });

  if (!order) {
    throw new Error('Failed to create order');
  }

  return order as unknown as OrderWithItems;
}
