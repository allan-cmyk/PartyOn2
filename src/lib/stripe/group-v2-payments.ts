/**
 * Group Orders V2 - Stripe Payment Integration
 * Participant item checkout and host delivery fee invoices
 */

import Stripe from 'stripe';
import { stripe } from './client';
import { prisma } from '@/lib/database/client';
import { DEFAULT_TAX_RATE } from '@/lib/tax';
import { moveDraftToPurchased } from '@/lib/group-orders-v2/service';
import { notifyNewOrder, type GhlOrderPayload } from '@/lib/webhooks/ghl';

// ==========================================
// Types
// ==========================================

interface DraftItemForCheckout {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string | null;
  price: { toString(): string } | number;
  imageUrl: string | null;
  quantity: number;
}

interface CreateCheckoutInput {
  groupOrderId: string;
  subOrderId: string;
  participantId: string;
  participantEmail?: string;
  participantName: string;
  draftItems: DraftItemForCheckout[];
  discountCode?: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreateDeliveryInvoiceInput {
  groupOrderId: string;
  subOrderId: string;
  hostParticipantId: string;
  hostEmail?: string;
  deliveryFee: number;
  discountCode?: string;
  successUrl: string;
  cancelUrl: string;
}

// ==========================================
// Participant Checkout
// ==========================================

export async function createGroupV2CheckoutSession(input: CreateCheckoutInput) {
  const {
    groupOrderId, subOrderId, participantId, participantEmail,
    draftItems, discountCode, successUrl, cancelUrl,
  } = input;

  // Calculate subtotal
  const subtotal = draftItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Resolve discount BEFORE calculating tax (tax applies to post-discount amount)
  let discountAmount = 0;
  let stripeCouponId: string | undefined;

  if (discountCode) {
    const discount = await prisma.discount.findUnique({
      where: { code: discountCode, isActive: true },
    });
    if (discount && discount.type === 'PERCENTAGE') {
      discountAmount = Math.round(subtotal * (Number(discount.value) / 100) * 100) / 100;
    } else if (discount && discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(Number(discount.value), subtotal);
    }
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'usd',
        duration: 'once',
        name: discountCode,
      });
      stripeCouponId = coupon.id;
    }
  }

  // Calculate tax on post-discount amount (Texas tax applies to actual selling price)
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * DEFAULT_TAX_RATE * 100) / 100;

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = draftItems.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        description:
          item.variantTitle && item.variantTitle !== 'Default Title'
            ? item.variantTitle
            : undefined,
        metadata: { productId: item.productId, variantId: item.variantId },
      },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: item.quantity,
  }));

  // Add tax line item (calculated on post-discount amount)
  if (taxAmount > 0) {
    const taxRateDisplay = `${(DEFAULT_TAX_RATE * 100).toFixed(2)}%`;
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Sales Tax (${taxRateDisplay})`,
          description: 'Texas sales tax',
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card', 'link'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'group_v2',
      groupOrderId,
      subOrderId,
      participantId,
    },
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    custom_text: {
      submit: {
        message: `Payment for your group order items (${draftItems.length} items).`,
      },
    },
  };

  if (participantEmail) {
    sessionParams.customer_email = participantEmail;
  }

  if (stripeCouponId) {
    sessionParams.discounts = [{ coupon: stripeCouponId }];
  }

  const total = subtotal + taxAmount - discountAmount;

  // Create Stripe session
  const session = await stripe.checkout.sessions.create(sessionParams);

  // Create ParticipantPayment record
  const payment = await prisma.participantPayment.create({
    data: {
      subOrderId,
      participantId,
      stripeCheckoutSessionId: session.id,
      subtotal,
      taxAmount,
      discountCode: discountCode || null,
      discountAmount,
      total,
      status: 'PENDING',
    },
  });

  return {
    checkoutUrl: session.url || '',
    sessionId: session.id,
    paymentId: payment.id,
  };
}

// ==========================================
// Delivery Fee Invoice
// ==========================================

export async function createDeliveryInvoiceSession(input: CreateDeliveryInvoiceInput) {
  const {
    groupOrderId, subOrderId, hostParticipantId, hostEmail,
    deliveryFee, discountCode, successUrl, cancelUrl,
  } = input;

  let discountAmount = 0;
  let feeWaived = false;

  // Check for FREE_SHIPPING discount
  if (discountCode) {
    const discount = await prisma.discount.findUnique({
      where: { code: discountCode, isActive: true },
    });
    if (discount && (discount.type === 'FREE_SHIPPING' || discount.freeShipping)) {
      feeWaived = true;
      discountAmount = deliveryFee;
    } else if (discount && discount.type === 'PERCENTAGE') {
      discountAmount = Math.round(deliveryFee * (Number(discount.value) / 100) * 100) / 100;
    } else if (discount && discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(Number(discount.value), deliveryFee);
    }
  }

  const total = Math.max(0, deliveryFee - discountAmount);

  // If fee is waived, just create the invoice record and return
  if (feeWaived || total === 0) {
    const invoice = await prisma.groupDeliveryInvoice.create({
      data: {
        subOrderId,
        hostParticipantId,
        deliveryFee,
        discountCode: discountCode || null,
        discountAmount,
        total: 0,
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    // Mark tab fee as waived
    await prisma.subOrder.update({
      where: { id: subOrderId },
      data: { deliveryFeeWaived: true },
    });
    return {
      checkoutUrl: successUrl,
      sessionId: '',
      invoiceId: invoice.id,
    };
  }

  // Create Stripe session for delivery fee
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card', 'link'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
            description: 'Group order delivery fee',
          },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'group_v2_delivery',
      groupOrderId,
      subOrderId,
      hostParticipantId,
    },
    billing_address_collection: 'required',
  };

  if (hostEmail) {
    sessionParams.customer_email = hostEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  // Create invoice record
  const invoice = await prisma.groupDeliveryInvoice.create({
    data: {
      subOrderId,
      hostParticipantId,
      deliveryFee,
      discountCode: discountCode || null,
      discountAmount,
      total,
      stripeCheckoutSessionId: session.id,
      status: 'PENDING',
    },
  });

  return {
    checkoutUrl: session.url || '',
    sessionId: session.id,
    invoiceId: invoice.id,
  };
}

// ==========================================
// Webhook Handlers
// ==========================================

/**
 * Handle successful participant checkout
 * Moves draft items to purchased, creates Order record
 */
export async function handleGroupV2PaymentCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const { groupOrderId, subOrderId, participantId } = session.metadata || {};
  if (!groupOrderId || !subOrderId || !participantId) {
    console.error('[Group V2 Payment] Missing metadata on session:', session.id);
    return;
  }

  // Find payment record
  const payment = await prisma.participantPayment.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (!payment) {
    console.error('[Group V2 Payment] Payment record not found:', session.id);
    return;
  }

  // Idempotency: skip if already processed
  if (payment.status === 'PAID') {
    console.log('[Group V2 Payment] Already processed:', session.id);
    return;
  }

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  // Update payment status
  await prisma.participantPayment.update({
    where: { id: payment.id },
    data: {
      stripePaymentIntentId: paymentIntentId || null,
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  // Move draft items to purchased
  await moveDraftToPurchased(subOrderId, participantId, payment.id);

  // Create Order record for this participant
  try {
    const participant = await prisma.groupParticipantV2.findUnique({
      where: { id: participantId },
    });
    const subOrder = await prisma.subOrder.findUnique({
      where: { id: subOrderId },
    });

    if (participant && subOrder) {
      const purchasedItems = await prisma.purchasedItem.findMany({
        where: { paymentId: payment.id },
      });

      // Resolve or create Customer for guest participants
      let customerId = participant.customerId;
      if (!customerId && participant.guestEmail) {
        const existing = await prisma.customer.findFirst({
          where: { email: participant.guestEmail },
        });
        if (existing) {
          customerId = existing.id;
        } else {
          const newCustomer = await prisma.customer.create({
            data: {
              email: participant.guestEmail,
              firstName: participant.guestName || 'Guest',
              lastName: '',
            },
          });
          customerId = newCustomer.id;
        }
        // Link participant to customer for future lookups
        await prisma.groupParticipantV2.update({
          where: { id: participantId },
          data: { customerId },
        });
      }

      if (!customerId) {
        console.error('[Group V2 Payment] No customer ID or email for participant:', participantId);
        return;
      }

      const order = await prisma.order.create({
        data: {
          customerId,
          status: 'CONFIRMED',
          financialStatus: 'PAID',
          fulfillmentStatus: 'UNFULFILLED',
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId || null,
          subtotal: payment.subtotal,
          taxAmount: payment.taxAmount,
          deliveryFee: 0, // Host pays delivery separately
          discountCode: payment.discountCode,
          discountAmount: payment.discountAmount,
          total: payment.total,
          deliveryDate: subOrder.deliveryDate,
          deliveryTime: subOrder.deliveryTime,
          deliveryAddress: subOrder.deliveryAddress || {},
          deliveryPhone: subOrder.deliveryPhone || '',
          customerEmail: participant.guestEmail || '',
          customerName: participant.guestName || 'Guest',
          groupOrderId: null, // V2 doesn't use v1 group order FK
          items: {
            create: purchasedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              variantTitle: item.variantTitle,
              price: item.price,
              quantity: item.quantity,
              totalPrice: Number(item.price) * item.quantity,
            })),
          },
        },
      });

      // Link order to payment
      await prisma.participantPayment.update({
        where: { id: payment.id },
        data: { orderId: order.id },
      });

      console.log('[Group V2 Payment] Order created:', order.orderNumber);

      // Notify GHL webhook
      const itemsSummary = purchasedItems
        .map((item) => {
          const name =
            item.variantTitle && item.variantTitle !== 'Default Title'
              ? `${item.title} - ${item.variantTitle}`
              : item.title;
          return `${item.quantity}x ${name} ($${Number(item.price).toFixed(2)})`;
        })
        .join(', ');
      const addr = (subOrder.deliveryAddress ?? {}) as Record<string, string>;
      const addrParts = [addr.address1, addr.address2, addr.city,
        [addr.province, addr.zip].filter(Boolean).join(' ')].filter(Boolean);
      const ghlPayload: GhlOrderPayload = {
        event: 'order.created',
        orderNumber: order.orderNumber,
        orderType: 'group_v2',
        customerName: participant.guestName || 'Guest',
        customerEmail: participant.guestEmail || '',
        customerPhone: '',
        itemsSummary,
        subtotal: Number(payment.subtotal),
        tax: Number(payment.taxAmount),
        deliveryFee: 0,
        discount: Number(payment.discountAmount),
        total: Number(payment.total),
        deliveryDate: subOrder.deliveryDate.toISOString().split('T')[0],
        deliveryTime: subOrder.deliveryTime,
        deliveryAddress: addrParts.join(', '),
        deliveryType: 'HOUSE',
        deliveryInstructions: '',
        createdAt: order.createdAt.toISOString(),
      };
      await notifyNewOrder(ghlPayload);
    }
  } catch (orderError) {
    console.error('[Group V2 Payment] Failed to create order:', orderError);
    // Payment was successful, order creation is non-blocking
  }

  console.log('[Group V2 Payment] Completed for participant:', participantId);
}

/**
 * Handle successful delivery fee payment
 */
export async function handleGroupV2DeliveryPayment(
  session: Stripe.Checkout.Session
): Promise<void> {
  const { subOrderId } = session.metadata || {};
  if (!subOrderId) {
    console.error('[Group V2 Delivery] Missing metadata:', session.id);
    return;
  }

  const invoice = await prisma.groupDeliveryInvoice.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (!invoice) {
    console.error('[Group V2 Delivery] Invoice not found:', session.id);
    return;
  }

  if (invoice.status === 'PAID') {
    console.log('[Group V2 Delivery] Already processed:', session.id);
    return;
  }

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  await prisma.groupDeliveryInvoice.update({
    where: { id: invoice.id },
    data: {
      stripePaymentIntentId: paymentIntentId || null,
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  console.log('[Group V2 Delivery] Invoice paid for tab:', subOrderId);
}
