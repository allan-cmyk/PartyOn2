/**
 * Group Orders V2 - Stripe Payment Integration
 * Participant item checkout and host delivery fee invoices
 */

import Stripe from 'stripe';
import { stripe } from './client';
import { prisma } from '@/lib/database/client';
import { DEFAULT_TAX_RATE } from '@/lib/tax';
import { moveDraftToPurchased, moveAllDraftsToPurchased } from '@/lib/group-orders-v2/service';
import { notifyNewOrder, buildGhlPayload } from '@/lib/webhooks/ghl';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { recordDiscountUsage } from '@/lib/discounts/discount-engine';
import { linkOrderToAffiliate } from '@/lib/affiliates/commission-engine';
import { getAffiliateByCode } from '@/lib/affiliates/affiliate-service';
import { createOrderCalendarEvent } from '@/lib/calendar/google-calendar';

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
  tipAmount?: number;
  successUrl: string;
  cancelUrl: string;
  checkoutType?: 'participant' | 'all';
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

  // Add tip line item
  const tipAmount = input.tipAmount && input.tipAmount > 0 ? input.tipAmount : 0;
  if (tipAmount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tip for the Party On Team',
        },
        unit_amount: Math.round(tipAmount * 100),
      },
      quantity: 1,
    });
  }

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
      checkoutType: input.checkoutType || 'participant',
      ...(tipAmount > 0 ? { tipAmount: String(tipAmount) } : {}),
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

  const total = subtotal + taxAmount - discountAmount + tipAmount;

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
 *
 * CRITICAL: If order creation fails, this function THROWS so Stripe
 * retries the webhook. Non-fatal side effects (email, GHL, calendar)
 * are wrapped in individual try/catch blocks.
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

  // Idempotency: skip if order already created (orderId set)
  if (payment.orderId) {
    console.log('[Group V2 Payment] Already processed (orderId set):', session.id);
    return;
  }

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  // Update payment status to PAID (if not already)
  if (payment.status !== 'PAID') {
    await prisma.participantPayment.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: paymentIntentId || null,
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }

  // Move draft items to purchased
  const checkoutType = session.metadata?.checkoutType;
  if (checkoutType === 'all') {
    await moveAllDraftsToPurchased(subOrderId, participantId, payment.id);
  } else {
    await moveDraftToPurchased(subOrderId, participantId, payment.id);
  }

  // --- CRITICAL: Create Order record (throws on failure so Stripe retries) ---
  const participant = await prisma.groupParticipantV2.findUnique({
    where: { id: participantId },
  });
  const subOrder = await prisma.subOrder.findUnique({
    where: { id: subOrderId },
  });

  if (!participant || !subOrder) {
    throw new Error(`[Group V2 Payment] Participant or SubOrder not found: participant=${participantId} subOrder=${subOrderId}`);
  }

  const purchasedItems = await prisma.purchasedItem.findMany({
    where: { paymentId: payment.id },
  });

  // Resolve or create Customer for guest participants
  // Fall back to Stripe checkout session email/name when participant record is missing them
  const customerEmail = participant.guestEmail || session.customer_details?.email || '';
  const customerName = (participant.guestName && participant.guestName !== 'Party Host')
    ? participant.guestName
    : session.customer_details?.name || participant.guestName || 'Guest';
  const customerPhone = participant.guestPhone || session.customer_details?.phone || '';

  let customerId = participant.customerId;
  if (!customerId && customerEmail) {
    const existing = await prisma.customer.findFirst({
      where: { email: customerEmail },
    });
    if (existing) {
      customerId = existing.id;
    } else {
      const nameParts = customerName.split(' ');
      const newCustomer = await prisma.customer.create({
        data: {
          email: customerEmail,
          firstName: nameParts[0] || 'Guest',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: customerPhone || undefined,
        },
      });
      customerId = newCustomer.id;
    }
    // Link participant to customer and update their details for future lookups
    await prisma.groupParticipantV2.update({
      where: { id: participantId },
      data: {
        customerId,
        guestEmail: participant.guestEmail || customerEmail || undefined,
        guestName: customerName !== participant.guestName ? customerName : undefined,
        guestPhone: participant.guestPhone || customerPhone || undefined,
      },
    });
  }

  if (!customerId) {
    throw new Error(`[Group V2 Payment] No customer ID or email for participant: ${participantId}`);
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
      deliveryPhone: subOrder.deliveryPhone || customerPhone || '',
      customerEmail: customerEmail,
      customerName: customerName,
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
    include: { items: true },
  });

  // Link order to payment (acts as idempotency marker for retries)
  await prisma.participantPayment.update({
    where: { id: payment.id },
    data: { orderId: order.id },
  });

  console.log('[Group V2 Payment] Order created:', order.orderNumber);

  // --- NON-FATAL side effects below (each in its own try/catch) ---

  // Record discount usage
  if (payment.discountCode && Number(payment.discountAmount) > 0) {
    try {
      await recordDiscountUsage(
        payment.discountCode,
        order.id,
        customerId,
        Number(payment.discountAmount)
      );
      console.log('[Group V2 Payment] Discount usage recorded:', payment.discountCode);
    } catch (discountErr) {
      console.error('[Group V2 Payment] Failed to record discount usage:', discountErr);
    }
  }

  // Link order to affiliate if attributed
  const affiliateCode = session.metadata?.affiliateCode;
  let affiliateEmail: string | null = null;
  if (affiliateCode) {
    try {
      await linkOrderToAffiliate(order, affiliateCode);
      const affiliate = await getAffiliateByCode(affiliateCode);
      if (affiliate?.email) {
        affiliateEmail = affiliate.email;
      }
      console.log('[Group V2 Payment] Linked to affiliate:', affiliateCode);
    } catch (affiliateErr) {
      console.error('[Group V2 Payment] Failed to link affiliate:', affiliateErr);
    }
  }

  // Notify GHL webhook
  try {
    await notifyNewOrder(buildGhlPayload(order, 'group_v2'));
  } catch (ghlErr) {
    console.error('[Group V2 Payment] GHL notify failed:', ghlErr);
  }

  // Create delivery task
  try {
    await prisma.deliveryTask.create({
      data: {
        orderId: order.id,
        scheduledDate: subOrder.deliveryDate,
        scheduledTime: subOrder.deliveryTime,
        status: 'PENDING',
      },
    });
    console.log('[Group V2 Payment] Delivery task created for order:', order.orderNumber);
  } catch (deliveryErr) {
    console.error('[Group V2 Payment] Failed to create delivery task:', deliveryErr);
  }

  // Create Google Calendar event
  createOrderCalendarEvent(order).catch((calErr) =>
    console.error('[Group V2 Payment] Calendar event failed:', calErr)
  );

  // Send confirmation email
  try {
    const deliveryAddress = subOrder.deliveryAddress as {
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
    }, affiliateEmail ? { cc: [affiliateEmail] } : undefined);
    console.log('[Group V2 Payment] Confirmation email sent for order:', order.orderNumber);
  } catch (emailErr) {
    console.error('[Group V2 Payment] Failed to send confirmation email:', emailErr);
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
