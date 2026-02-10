/**
 * Group Order Multi-Payment System
 * Handles creating and managing individual payment sessions for group order participants
 */

import Stripe from 'stripe';
import { stripe } from './client';
import { prisma } from '@/lib/database/client';
import { PaymentStatus } from '@prisma/client';

/**
 * Metadata stored with group order Stripe sessions
 */
export interface GroupPaymentMetadata {
  groupOrderId: string;
  participantId: string;
  shareCode: string;
  isGroupOrder: 'true';
}

/**
 * Participant cart item for checkout
 */
export interface ParticipantCartItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  price: number; // in dollars
  imageUrl?: string;
}

/**
 * Options for creating a participant checkout session
 */
export interface CreateParticipantCheckoutOptions {
  groupOrderId: string;
  participantId: string;
  items: ParticipantCartItem[];
  subtotal: number;
  taxAmount: number;
  deliveryContribution: number;
  total: number;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt?: Date;
}

/**
 * Payment status summary for a group order
 */
export interface GroupPaymentSummary {
  groupOrderId: string;
  shareCode: string;
  totalExpected: number;
  totalPaid: number;
  totalPending: number;
  participantCount: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  isFullyPaid: boolean;
  payments: {
    participantId: string;
    participantName: string;
    amount: number;
    status: PaymentStatus;
    paidAt: Date | null;
  }[];
}

/**
 * Calculate delivery fee contribution for a participant
 * Delivery fee is split proportionally based on cart total
 */
export function calculateDeliveryContribution(
  participantSubtotal: number,
  groupSubtotal: number,
  totalDeliveryFee: number
): number {
  if (groupSubtotal === 0) return 0;
  return Math.round((participantSubtotal / groupSubtotal) * totalDeliveryFee * 100) / 100;
}

/**
 * Calculate tax for a participant (Texas 8.25%)
 */
export function calculateParticipantTax(subtotal: number): number {
  return Math.round(subtotal * 0.0825 * 100) / 100;
}

/**
 * Create a Stripe Checkout session for a group order participant
 */
export async function createParticipantCheckoutSession(
  options: CreateParticipantCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const {
    groupOrderId,
    participantId,
    items,
    subtotal,
    taxAmount,
    deliveryContribution,
    total,
    customerEmail,
    successUrl,
    cancelUrl,
    expiresAt,
  } = options;

  // Get group order for additional context
  const groupOrder = await prisma.groupOrder.findUnique({
    where: { id: groupOrderId },
    include: {
      payments: { where: { participantId } },
    },
  });

  if (!groupOrder) {
    throw new Error('Group order not found');
  }

  // Check if payment already exists and is not expired/failed
  const existingPayment = groupOrder.payments[0];
  if (existingPayment) {
    if (existingPayment.status === 'PAID') {
      throw new Error('Participant has already paid');
    }
    if (existingPayment.status === 'PROCESSING') {
      throw new Error('Payment is already being processed');
    }
    // If PENDING, EXPIRED, or FAILED, we can create a new session
    // First, expire the old session if it exists
    if (existingPayment.stripeCheckoutSessionId) {
      try {
        await stripe.checkout.sessions.expire(existingPayment.stripeCheckoutSessionId);
      } catch {
        // Session may already be expired, continue
      }
    }
  }

  // Build line items for Stripe
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        description: item.variantTitle && item.variantTitle !== 'Default Title'
          ? item.variantTitle
          : undefined,
        metadata: {
          productId: item.productId,
          variantId: item.variantId,
        },
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  // Add delivery fee contribution
  if (deliveryContribution > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee (Your Share)',
          description: `Delivery to ${groupOrder.name} group order`,
        },
        unit_amount: Math.round(deliveryContribution * 100),
      },
      quantity: 1,
    });
  }

  // Add tax
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

  // Build metadata
  const metadata: GroupPaymentMetadata = {
    groupOrderId,
    participantId,
    shareCode: groupOrder.shareCode,
    isGroupOrder: 'true',
  };

  // Calculate session expiration (default 24 hours, max 24 hours for Stripe)
  const expiresAtTimestamp = expiresAt
    ? Math.min(
        Math.floor(expiresAt.getTime() / 1000),
        Math.floor(Date.now() / 1000) + 24 * 60 * 60
      )
    : Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  // Create checkout session params
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card', 'link'],
    line_items: lineItems,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&group=${groupOrder.shareCode}`,
    cancel_url: `${cancelUrl}?group=${groupOrder.shareCode}`,
    metadata: metadata as unknown as Record<string, string>,
    expires_at: expiresAtTimestamp,
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    custom_text: {
      submit: {
        message: `Payment for ${groupOrder.name} group order. ` +
          `Your items will be delivered with the group order on ${groupOrder.deliveryDate.toLocaleDateString()}.`,
      },
    },
  };

  // Add customer email if available
  if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Create the session
  const session = await stripe.checkout.sessions.create(sessionParams);

  // Create or update GroupOrderPayment record
  if (existingPayment) {
    await prisma.groupOrderPayment.update({
      where: { id: existingPayment.id },
      data: {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: null, // Will be set when payment completes
        subtotal,
        taxAmount,
        deliveryContribution,
        total,
        status: 'PENDING',
        expiresAt: new Date(expiresAtTimestamp * 1000),
      },
    });
  } else {
    await prisma.groupOrderPayment.create({
      data: {
        groupOrderId,
        participantId,
        stripeCheckoutSessionId: session.id,
        subtotal,
        taxAmount,
        deliveryContribution,
        total,
        status: 'PENDING',
        expiresAt: new Date(expiresAtTimestamp * 1000),
      },
    });
  }

  return session;
}

/**
 * Handle successful payment for a group order participant
 */
export async function handleGroupPaymentCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const metadata = session.metadata as unknown as GroupPaymentMetadata;

  if (!metadata?.isGroupOrder || metadata.isGroupOrder !== 'true') {
    return; // Not a group order payment
  }

  const { groupOrderId, participantId } = metadata;

  // Update payment record
  const payment = await prisma.groupOrderPayment.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  });

  if (!payment) {
    console.error('[Group Payment] Payment record not found for session:', session.id);
    return;
  }

  // Get payment intent ID from session
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  // Update payment status
  await prisma.groupOrderPayment.update({
    where: { id: payment.id },
    data: {
      stripePaymentIntentId: paymentIntentId || null,
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  // Update participant status
  await prisma.groupParticipant.update({
    where: { id: participantId },
    data: {
      checkedOutAt: new Date(),
    },
  });

  // Update group order totals
  await updateGroupOrderTotals(groupOrderId);
}

/**
 * Handle failed payment for a group order participant
 */
export async function handleGroupPaymentFailed(
  session: Stripe.Checkout.Session
): Promise<void> {
  const metadata = session.metadata as unknown as GroupPaymentMetadata;

  if (!metadata?.isGroupOrder || metadata.isGroupOrder !== 'true') {
    return;
  }

  // Update payment record
  const payment = await prisma.groupOrderPayment.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  });

  if (payment) {
    await prisma.groupOrderPayment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
      },
    });
  }
}

/**
 * Handle expired checkout session for a group order participant
 */
export async function handleGroupPaymentExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  const metadata = session.metadata as unknown as GroupPaymentMetadata;

  if (!metadata?.isGroupOrder || metadata.isGroupOrder !== 'true') {
    return;
  }

  // Update payment record
  const payment = await prisma.groupOrderPayment.findFirst({
    where: { stripeCheckoutSessionId: session.id },
  });

  if (payment && payment.status === 'PENDING') {
    await prisma.groupOrderPayment.update({
      where: { id: payment.id },
      data: {
        status: 'EXPIRED',
      },
    });
  }
}

/**
 * Update group order total paid/expected amounts
 * Note: totalPaid/totalExpected not stored on GroupOrder model
 * These values are calculated on-the-fly from payments
 */
async function updateGroupOrderTotals(groupOrderId: string): Promise<void> {
  // Just verify the group order exists - totals are computed from payments
  const groupOrder = await prisma.groupOrder.findUnique({
    where: { id: groupOrderId },
  });

  if (!groupOrder) {
    console.warn(`[Group Payments] Group order ${groupOrderId} not found for totals update`);
  }
  // Totals are calculated from payments on-the-fly, not stored
}

/**
 * Get payment summary for a group order
 */
export async function getGroupPaymentSummary(
  groupOrderId: string
): Promise<GroupPaymentSummary | null> {
  const groupOrder = await prisma.groupOrder.findUnique({
    where: { id: groupOrderId },
    include: {
      payments: {
        include: {
          participant: true,
        },
      },
    },
  });

  if (!groupOrder) {
    return null;
  }

  const payments = groupOrder.payments.map((p) => ({
    participantId: p.participantId,
    participantName: p.participant.guestName || p.participant.guestEmail || 'Unknown',
    amount: Number(p.total),
    status: p.status,
    paidAt: p.paidAt,
  }));

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    groupOrderId,
    shareCode: groupOrder.shareCode,
    totalExpected,
    totalPaid,
    totalPending,
    participantCount: payments.length,
    paidCount: payments.filter((p) => p.status === 'PAID').length,
    pendingCount: payments.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').length,
    failedCount: payments.filter((p) => p.status === 'FAILED').length,
    isFullyPaid: totalPaid >= totalExpected && totalExpected > 0,
    payments,
  };
}

/**
 * Refund a participant's payment
 */
export async function refundParticipantPayment(
  participantId: string,
  reason?: string
): Promise<Stripe.Refund | null> {
  const payment = await prisma.groupOrderPayment.findFirst({
    where: { participantId },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'PAID') {
    throw new Error('Cannot refund - payment is not in PAID status');
  }

  if (!payment.stripePaymentIntentId) {
    throw new Error('No payment intent found for this payment');
  }

  // Create Stripe refund
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    reason: 'requested_by_customer',
    metadata: {
      participantId,
      groupOrderId: payment.groupOrderId,
      reason: reason || 'Group order refund',
    },
  });

  // Update payment record status
  await prisma.groupOrderPayment.update({
    where: { id: payment.id },
    data: {
      status: 'REFUNDED',
    },
  });

  // Update group order totals
  await updateGroupOrderTotals(payment.groupOrderId);

  return refund;
}

/**
 * Cancel all pending payments for a group order (host cancellation)
 */
export async function cancelAllGroupPayments(
  groupOrderId: string,
  refundPaidPayments: boolean = true
): Promise<{ refunded: number; cancelled: number }> {
  const payments = await prisma.groupOrderPayment.findMany({
    where: { groupOrderId },
  });

  let refunded = 0;
  let cancelled = 0;

  for (const payment of payments) {
    if (payment.status === 'PAID' && refundPaidPayments) {
      // Refund paid payments
      if (payment.stripePaymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            reason: 'requested_by_customer',
          });
          refunded++;
        } catch (error) {
          console.error('[Group Payment] Failed to refund:', error);
        }
      }

      await prisma.groupOrderPayment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
        },
      });
    } else if (payment.status === 'PENDING' || payment.status === 'PROCESSING') {
      // Expire pending checkout sessions
      if (payment.stripeCheckoutSessionId) {
        try {
          await stripe.checkout.sessions.expire(payment.stripeCheckoutSessionId);
        } catch {
          // Session may already be expired
        }
      }

      await prisma.groupOrderPayment.update({
        where: { id: payment.id },
        data: {
          status: 'EXPIRED',  // Use EXPIRED since CANCELLED is not a valid PaymentStatus
        },
      });
      cancelled++;
    }
  }

  // Update group order
  await prisma.groupOrder.update({
    where: { id: groupOrderId },
    data: {
      status: 'CANCELLED',
    },
  });

  return { refunded, cancelled };
}

/**
 * Process host decision for partial payments
 */
export async function processHostDecision(
  groupOrderId: string,
  decision: 'PROCEED_PARTIAL' | 'CANCEL_REFUND_ALL' | 'EXTEND_DEADLINE',
  newDeadline?: Date
): Promise<void> {
  const groupOrder = await prisma.groupOrder.findUnique({
    where: { id: groupOrderId },
    include: {
      payments: true,
    },
  });

  if (!groupOrder) {
    throw new Error('Group order not found');
  }

  switch (decision) {
    case 'PROCEED_PARTIAL': {
      // Cancel unpaid payments, keep paid ones
      for (const payment of groupOrder.payments) {
        if (payment.status !== 'PAID') {
          if (payment.stripeCheckoutSessionId) {
            try {
              await stripe.checkout.sessions.expire(payment.stripeCheckoutSessionId);
            } catch {
              // Already expired
            }
          }
          await prisma.groupOrderPayment.update({
            where: { id: payment.id },
            data: { status: 'EXPIRED' },  // Use EXPIRED since CANCELLED is not a valid PaymentStatus
          });
        }
      }

      // Update group order to proceed with paid participants only
      await prisma.groupOrder.update({
        where: { id: groupOrderId },
        data: {
          hostDecision: 'PROCEED_PARTIAL',
          hostDecisionAt: new Date(),
          status: 'LOCKED', // Ready for fulfillment
        },
      });
      break;
    }

    case 'CANCEL_REFUND_ALL': {
      // Refund everyone and cancel
      await cancelAllGroupPayments(groupOrderId, true);

      await prisma.groupOrder.update({
        where: { id: groupOrderId },
        data: {
          hostDecision: 'CANCEL_REFUND_ALL',
          hostDecisionAt: new Date(),
        },
      });
      break;
    }

    case 'EXTEND_DEADLINE': {
      if (!newDeadline) {
        throw new Error('New deadline required for EXTEND_DEADLINE decision');
      }

      await prisma.groupOrder.update({
        where: { id: groupOrderId },
        data: {
          hostDecision: 'EXTEND_DEADLINE',
          hostDecisionAt: new Date(),
          paymentDeadline: newDeadline,
        },
      });
      break;
    }
  }
}

/**
 * Check if group order payment deadline has passed
 */
export async function checkPaymentDeadlines(): Promise<string[]> {
  const expiredOrders = await prisma.groupOrder.findMany({
    where: {
      status: 'ACTIVE',
      paymentDeadline: {
        lt: new Date(),
      },
      hostDecision: null,
    },
    include: {
      payments: true,
    },
  });

  const notifyHostIds: string[] = [];

  for (const order of expiredOrders) {
    const hasPendingPayments = order.payments.some(
      (p) => p.status === 'PENDING' || p.status === 'PROCESSING'
    );

    if (hasPendingPayments) {
      // Mark pending payments as expired
      await prisma.groupOrderPayment.updateMany({
        where: {
          groupOrderId: order.id,
          status: { in: ['PENDING', 'PROCESSING'] },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      notifyHostIds.push(order.id);
    }
  }

  return notifyHostIds;
}
