/**
 * Payout Service
 * Monthly payout generation and management
 */

import { prisma } from '@/lib/database/client';
import { CommissionStatus, PayoutStatus } from '@prisma/client';

/**
 * Generate monthly payouts for a given period (e.g., "2026-02").
 * Groups APPROVED commissions by affiliate and creates payout records.
 */
export async function generateMonthlyPayouts(year: number, month: number) {
  const payoutPeriod = `${year}-${String(month).padStart(2, '0')}`;

  // End-of-month cutoff. We sweep every APPROVED+unpaid commission created on or
  // before the end of the target month, regardless of when it was created. This
  // catches late-approved commissions from prior months that would otherwise
  // never roll into a payout (the previous window-only query silently skipped
  // them forever).
  const endOfMonth = new Date(year, month, 1);

  const commissions = await prisma.affiliateCommission.findMany({
    where: {
      status: CommissionStatus.APPROVED,
      payoutId: null,
      createdAt: { lt: endOfMonth },
    },
    orderBy: { affiliateId: 'asc' },
  });

  if (commissions.length === 0) {
    console.log(`[Payout] No approved commissions for ${payoutPeriod}`);
    return [];
  }

  // Group by affiliate
  const grouped = new Map<string, typeof commissions>();
  for (const c of commissions) {
    const existing = grouped.get(c.affiliateId) || [];
    existing.push(c);
    grouped.set(c.affiliateId, existing);
  }

  const payouts = [];

  for (const [affiliateId, affiliateCommissions] of grouped) {
    const totalAmountCents = affiliateCommissions.reduce(
      (sum, c) => sum + c.commissionAmountCents,
      0
    );

    if (totalAmountCents <= 0) continue;

    // Create payout with line items in a transaction
    const payout = await prisma.$transaction(async (tx) => {
      const newPayout = await tx.affiliatePayout.create({
        data: {
          affiliateId,
          payoutPeriod,
          totalAmountCents,
          status: PayoutStatus.PENDING,
        },
      });

      // Create line items
      for (const commission of affiliateCommissions) {
        await tx.payoutLineItem.create({
          data: {
            payoutId: newPayout.id,
            commissionId: commission.id,
            amountCents: commission.commissionAmountCents,
          },
        });
      }

      // Update commissions with payoutId and status PAID
      await tx.affiliateCommission.updateMany({
        where: {
          id: { in: affiliateCommissions.map((c) => c.id) },
        },
        data: {
          payoutId: newPayout.id,
          status: CommissionStatus.PAID,
        },
      });

      return newPayout;
    });

    payouts.push(payout);
    console.log(
      `[Payout] Created payout for affiliate ${affiliateId}: $${(totalAmountCents / 100).toFixed(2)} (${payoutPeriod})`
    );
  }

  return payouts;
}

/**
 * Mark a payout as completed
 */
export async function markPayoutCompleted(payoutId: string) {
  return prisma.affiliatePayout.update({
    where: { id: payoutId },
    data: {
      status: PayoutStatus.COMPLETED,
      processedAt: new Date(),
    },
  });
}

/**
 * Mark a payout as failed
 */
export async function markPayoutFailed(payoutId: string, notes?: string) {
  return prisma.affiliatePayout.update({
    where: { id: payoutId },
    data: {
      status: PayoutStatus.FAILED,
      notes,
    },
  });
}

/**
 * List payouts with optional filters
 */
export async function listPayouts(filters?: {
  affiliateId?: string;
  status?: PayoutStatus;
  payoutPeriod?: string;
}) {
  return prisma.affiliatePayout.findMany({
    where: {
      affiliateId: filters?.affiliateId,
      status: filters?.status,
      payoutPeriod: filters?.payoutPeriod,
    },
    include: {
      affiliate: {
        select: { id: true, code: true, contactName: true, businessName: true, email: true },
      },
      _count: { select: { commissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get payout detail with line items
 */
export async function getPayoutById(payoutId: string) {
  return prisma.affiliatePayout.findUnique({
    where: { id: payoutId },
    include: {
      affiliate: true,
      lineItems: true,
      commissions: {
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              subtotal: true,
              total: true,
              customerName: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
}
