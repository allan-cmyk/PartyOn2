/**
 * Commission Engine
 * Progressive tier calculation and commission lifecycle management
 * Tiers are based on rolling annual revenue from the affiliate's start date.
 */

import { prisma } from '@/lib/database/client';
import { CommissionStatus } from '@prisma/client';

/**
 * Progressive commission tiers (in cents)
 *
 * Tier 1: $0 - $10,000 revenue -> 5%
 * Tier 2: $10,001 - $20,000 revenue -> 8%
 * Tier 3: $20,001+ revenue -> 10%
 */
const TIER_1_CEILING = 1_000_000; // $10,000 in cents
const TIER_2_CEILING = 2_000_000; // $20,000 in cents
const TIER_1_RATE = 0.05;
const TIER_2_RATE = 0.08;
const TIER_3_RATE = 0.10;

/**
 * Calculate cumulative commission for a given total revenue amount (in cents).
 * Returns commission in cents.
 */
export function progressiveCommission(totalRevenueCents: number): number {
  const tier1 = Math.min(totalRevenueCents, TIER_1_CEILING) * TIER_1_RATE;
  const tier2 = Math.min(Math.max(totalRevenueCents - TIER_1_CEILING, 0), TIER_2_CEILING - TIER_1_CEILING) * TIER_2_RATE;
  const tier3 = Math.max(totalRevenueCents - TIER_2_CEILING, 0) * TIER_3_RATE;
  return Math.round(tier1 + tier2 + tier3);
}

/**
 * Get the current tier label for a revenue amount (in cents)
 */
export function getTierLabel(revenueCents: number): string {
  if (revenueCents <= TIER_1_CEILING) return '5% / $0-10k';
  if (revenueCents <= TIER_2_CEILING) return '8% / $10k-20k';
  return '10% / $20k+';
}

/**
 * Get the current tier rate for a revenue amount (in cents)
 */
export function getTierRate(revenueCents: number): number {
  if (revenueCents <= TIER_1_CEILING) return TIER_1_RATE;
  if (revenueCents <= TIER_2_CEILING) return TIER_2_RATE;
  return TIER_3_RATE;
}

/**
 * Get tier progress percentage towards next tier
 */
export function getTierProgress(revenueCents: number): number {
  if (revenueCents <= TIER_1_CEILING) {
    return Math.min((revenueCents / TIER_1_CEILING) * 100, 100);
  }
  if (revenueCents <= TIER_2_CEILING) {
    return Math.min(((revenueCents - TIER_1_CEILING) / (TIER_2_CEILING - TIER_1_CEILING)) * 100, 100);
  }
  return 100;
}

/**
 * Get the start of the current tier year for an affiliate.
 * Uses a rolling 12-month window based on the affiliate's createdAt date.
 * E.g. if affiliate joined June 15 2025, their tier year runs Jun 15 - Jun 14 each year.
 */
export function getAnniversaryYearStart(affiliateCreatedAt: Date): Date {
  const now = new Date();
  const month = affiliateCreatedAt.getMonth();
  const day = affiliateCreatedAt.getDate();

  // Start of current anniversary year
  let start = new Date(now.getFullYear(), month, day);
  if (start > now) {
    start = new Date(now.getFullYear() - 1, month, day);
  }
  return start;
}

/**
 * Get current-year commission base revenue for an affiliate (in cents).
 * Only counts commissions that are not VOID.
 * Uses rolling annual window from affiliate's join date.
 */
export async function getYearToDateRevenue(affiliateId: string): Promise<number> {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    select: { createdAt: true },
  });

  const yearStart = affiliate
    ? getAnniversaryYearStart(affiliate.createdAt)
    : new Date(new Date().getFullYear(), 0, 1);

  const result = await prisma.affiliateCommission.aggregate({
    where: {
      affiliateId,
      createdAt: { gte: yearStart },
      status: { not: CommissionStatus.VOID },
    },
    _sum: {
      commissionBaseCents: true,
    },
  });

  return result._sum.commissionBaseCents || 0;
}

/**
 * Calculate commission for a single order.
 * Uses progressive formula: commission for (prior + this) minus commission for (prior).
 *
 * @param affiliateId The affiliate
 * @param orderBaseCents The order's commissionable amount in cents (subtotal - discount, excluding delivery/tax)
 * @returns { commissionAmountCents, commissionRate, tierAtTime, priorRevenueCents }
 */
export async function calculateCommission(
  affiliateId: string,
  orderBaseCents: number,
  overrideRate?: number
): Promise<{
  commissionAmountCents: number;
  commissionRate: number;
  tierAtTime: string;
  priorRevenueCents: number;
}> {
  const priorRevenueCents = await getYearToDateRevenue(affiliateId);

  // Use flat override rate if provided
  if (overrideRate && overrideRate > 0) {
    const commissionAmountCents = Math.round(orderBaseCents * overrideRate);
    return {
      commissionAmountCents,
      commissionRate: overrideRate,
      tierAtTime: `Custom ${(overrideRate * 100)}%`,
      priorRevenueCents,
    };
  }

  const totalAfter = priorRevenueCents + orderBaseCents;

  const commissionAmountCents = progressiveCommission(totalAfter) - progressiveCommission(priorRevenueCents);
  const effectiveRate = orderBaseCents > 0 ? commissionAmountCents / orderBaseCents : 0;
  const tierAtTime = getTierLabel(totalAfter);

  return {
    commissionAmountCents,
    commissionRate: Math.round(effectiveRate * 10000) / 10000, // 4 decimal places
    tierAtTime,
    priorRevenueCents,
  };
}

/**
 * Create a commission record for an order linked to an affiliate.
 */
export async function createCommissionForOrder(
  affiliateId: string,
  orderId: string,
  orderBaseCents: number,
  isSelfReferral: boolean,
  overrideRate?: number
) {
  const { commissionAmountCents, commissionRate, tierAtTime } = await calculateCommission(
    affiliateId,
    orderBaseCents,
    overrideRate
  );

  return prisma.affiliateCommission.create({
    data: {
      affiliateId,
      orderId,
      commissionBaseCents: orderBaseCents,
      commissionRate,
      commissionAmountCents,
      tierAtTime,
      status: isSelfReferral ? CommissionStatus.HELD_REVIEW : CommissionStatus.HELD,
      isSelfReferral,
      // deliveredAt and holdUntil are null -- set when order is delivered
    },
  });
}

/**
 * Link an order to an affiliate: set affiliateId on Order and create commission.
 * Called from webhook handler after order creation.
 */
export async function linkOrderToAffiliate(
  order: {
    id: string;
    subtotal: { toString(): string };
    discountAmount: { toString(): string };
    customerEmail: string;
  },
  affiliateCode: string
) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: affiliateCode.toUpperCase() },
  });

  if (!affiliate || affiliate.status !== 'ACTIVE') {
    console.log('[Affiliate] Invalid or inactive code:', affiliateCode);
    return null;
  }

  // Update order with affiliateId
  await prisma.order.update({
    where: { id: order.id },
    data: { affiliateId: affiliate.id },
  });

  // Calculate commissionable base (subtotal - discount, in cents)
  const subtotalCents = Math.round(Number(order.subtotal) * 100);
  const discountCents = Math.round(Number(order.discountAmount) * 100);
  const orderBaseCents = Math.max(subtotalCents - discountCents, 0);

  // Check self-referral
  const isSelfReferral = order.customerEmail.toLowerCase() === affiliate.email.toLowerCase();

  // Use override rate if set on the affiliate
  const overrideRate = affiliate.commissionRateOverride ? Number(affiliate.commissionRateOverride) : undefined;

  // Create commission
  const commission = await createCommissionForOrder(
    affiliate.id,
    order.id,
    orderBaseCents,
    isSelfReferral,
    overrideRate
  );

  console.log(
    `[Affiliate] Commission created: $${(commission.commissionAmountCents / 100).toFixed(2)} ` +
    `for order ${order.id} (affiliate ${affiliate.code}, tier ${commission.tierAtTime}` +
    `${isSelfReferral ? ', SELF-REFERRAL' : ''})`
  );

  return commission;
}

/**
 * Void a commission for a given order (e.g., on refund/cancel).
 */
export async function voidCommissionForOrder(orderId: string, reason: string) {
  const commissions = await prisma.affiliateCommission.findMany({
    where: { orderId },
  });

  for (const commission of commissions) {
    if (commission.status === 'PAID') {
      // Flag for admin review, don't auto-void paid commissions
      await prisma.affiliateCommission.update({
        where: { id: commission.id },
        data: {
          voidedReason: `${reason}_after_payout`,
        },
      });
      console.log(`[Affiliate] Paid commission ${commission.id} flagged for review: ${reason}`);
    } else if (['HELD', 'HELD_REVIEW', 'APPROVED'].includes(commission.status)) {
      await prisma.affiliateCommission.update({
        where: { id: commission.id },
        data: {
          status: CommissionStatus.VOID,
          voidedAt: new Date(),
          voidedReason: reason,
        },
      });
      console.log(`[Affiliate] Commission ${commission.id} voided: ${reason}`);
    }
  }
}

/**
 * Mark commissions as delivered and set holdUntil for a batch of order IDs.
 * Called after bulk-fulfill sets orders to DELIVERED.
 */
export async function markCommissionsDelivered(orderIds: string[]) {
  const now = new Date();
  const holdUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const result = await prisma.affiliateCommission.updateMany({
    where: {
      orderId: { in: orderIds },
      deliveredAt: null,
      status: { in: [CommissionStatus.HELD, CommissionStatus.HELD_REVIEW] },
    },
    data: {
      deliveredAt: now,
      holdUntil,
    },
  });

  if (result.count > 0) {
    console.log(`[Affiliate] Marked ${result.count} commissions as delivered, hold until ${holdUntil.toISOString()}`);
  }

  return result.count;
}
