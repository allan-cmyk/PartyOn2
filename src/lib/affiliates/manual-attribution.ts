/**
 * Manual (retroactive) affiliate attribution.
 *
 * Used by the /admin/affiliates/[id] UI to attribute past orders that were not
 * captured by the normal ?ref= + cookie flow — e.g. when a partner created a
 * draft order outside the tracking context, or when a sale was captured in
 * an external system entirely.
 */

import { prisma } from '@/lib/database/client';
import {
  CommissionStatus,
  OrderStatus,
  FinancialStatus,
  FulfillmentStatus,
  type AffiliateCommission,
  type Order,
} from '@prisma/client';
import { calculateCommission } from './commission-engine';

export interface LinkExistingOrderInput {
  affiliateId: string;
  orderNumber: number;
}

export interface LinkExistingOrderResult {
  order: Pick<Order, 'id' | 'orderNumber' | 'customerName' | 'subtotal' | 'total'>;
  commission: AffiliateCommission | null;
  alreadyAttributedTo: string | null;
}

/**
 * Attribute an existing order to an affiliate and create an APPROVED commission.
 * Status is APPROVED (not HELD) since these orders are past their refund window
 * by the time an admin is manually attributing them.
 */
export async function linkExistingOrderToAffiliate(
  input: LinkExistingOrderInput
): Promise<LinkExistingOrderResult> {
  const order = await prisma.order.findFirst({
    where: { orderNumber: input.orderNumber },
    select: {
      id: true, orderNumber: true, customerName: true, customerEmail: true,
      subtotal: true, discountAmount: true, total: true, affiliateId: true,
      createdAt: true,
    },
  });
  if (!order) throw new Error(`Order #${input.orderNumber} not found`);
  if (order.affiliateId && order.affiliateId !== input.affiliateId) {
    return {
      order,
      commission: null,
      alreadyAttributedTo: order.affiliateId,
    };
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: input.affiliateId },
    select: { id: true, email: true, commissionRateOverride: true },
  });
  if (!affiliate) throw new Error('Affiliate not found');

  const subtotalCents = Math.round(Number(order.subtotal) * 100);
  const discountCents = Math.round(Number(order.discountAmount) * 100);
  const baseCents = Math.max(subtotalCents - discountCents, 0);

  const overrideRate = affiliate.commissionRateOverride !== null
    ? Number(affiliate.commissionRateOverride)
    : undefined;
  const { commissionAmountCents, commissionRate, tierAtTime } = await calculateCommission(
    affiliate.id,
    baseCents,
    overrideRate
  );

  const isSelfReferral = (order.customerEmail || '').toLowerCase() === (affiliate.email || '').toLowerCase();

  const commission = await prisma.$transaction(async (tx) => {
    if (!order.affiliateId) {
      await tx.order.update({ where: { id: order.id }, data: { affiliateId: affiliate.id } });
    }
    const existing = await tx.affiliateCommission.findFirst({
      where: { orderId: order.id, affiliateId: affiliate.id },
    });
    if (existing) return existing;
    if (commissionAmountCents <= 0) return null;
    return tx.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        orderId: order.id,
        commissionBaseCents: baseCents,
        commissionRate,
        commissionAmountCents,
        tierAtTime,
        status: CommissionStatus.APPROVED,
        isSelfReferral,
        deliveredAt: order.createdAt,
      },
    });
  });

  return { order, commission, alreadyAttributedTo: null };
}

export interface ExternalOrderInput {
  affiliateId: string;
  /** Short label for the order — e.g. "Rice/Gaudreau Wedding". Used as customerName. */
  label: string;
  /** Total amount to use as the commission base (in dollars). */
  totalAmount: number;
  /** Event/delivery date as YYYY-MM-DD. */
  eventDate: string;
  /** Optional free-form note stored on the Order. */
  notes?: string;
}

export interface ExternalOrderResult {
  order: Pick<Order, 'id' | 'orderNumber' | 'customerName' | 'total'>;
  commission: AffiliateCommission | null;
}

/**
 * Create a placeholder Order for an externally-captured sale and attribute it
 * to an affiliate. Commission base = totalAmount.
 */
export async function createExternalOrderForAffiliate(
  input: ExternalOrderInput
): Promise<ExternalOrderResult> {
  if (!input.label.trim()) throw new Error('Label is required');
  if (!Number.isFinite(input.totalAmount) || input.totalAmount <= 0) {
    throw new Error('totalAmount must be a positive number');
  }
  const eventDate = new Date(`${input.eventDate}T18:00:00Z`);
  if (Number.isNaN(eventDate.getTime())) throw new Error('Invalid eventDate (use YYYY-MM-DD)');

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: input.affiliateId },
    select: { id: true, code: true, email: true, commissionRateOverride: true },
  });
  if (!affiliate) throw new Error('Affiliate not found');

  const baseCents = Math.round(input.totalAmount * 100);
  const overrideRate = affiliate.commissionRateOverride !== null
    ? Number(affiliate.commissionRateOverride)
    : undefined;
  const { commissionAmountCents, commissionRate, tierAtTime } = await calculateCommission(
    affiliate.id,
    baseCents,
    overrideRate
  );

  const placeholderEmail = `external+${affiliate.code.toLowerCase()}-${Date.now()}@placeholder.partyondelivery.com`;

  const created = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        email: placeholderEmail,
        firstName: input.label.slice(0, 50),
        lastName: '(External)',
      },
    });
    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        status: OrderStatus.DELIVERED,
        financialStatus: FinancialStatus.PAID,
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
        subtotal: input.totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        deliveryFee: 0,
        tipAmount: 0,
        total: input.totalAmount,
        deliveryDate: eventDate,
        deliveryTime: 'N/A (external)',
        deliveryAddress: { address1: 'Externally captured', city: 'Austin', province: 'TX', zip: '', country: 'US' },
        deliveryPhone: 'N/A',
        customerEmail: placeholderEmail,
        customerName: input.label,
        affiliateId: affiliate.id,
        internalNote:
          `External order — captured outside Party On Delivery platform. ` +
          `Added for ${affiliate.code} commission tracking. ` +
          `Total $${input.totalAmount.toFixed(2)} treated as commission base.` +
          (input.notes ? `\nNotes: ${input.notes}` : ''),
      },
      select: { id: true, orderNumber: true, customerName: true, total: true, createdAt: true },
    });
    const commission = commissionAmountCents > 0
      ? await tx.affiliateCommission.create({
          data: {
            affiliateId: affiliate.id,
            orderId: order.id,
            commissionBaseCents: baseCents,
            commissionRate,
            commissionAmountCents,
            tierAtTime,
            status: CommissionStatus.APPROVED,
            isSelfReferral: false,
            deliveredAt: order.createdAt,
          },
        })
      : null;
    return { order, commission };
  });

  return created;
}
