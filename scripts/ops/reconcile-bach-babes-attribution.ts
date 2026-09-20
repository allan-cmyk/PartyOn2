/**
 * Backfill missing BACHBABES affiliate attribution (audit 2026-09-19, PR #435).
 *
 * Bug being repaired: /partners/<slug> visits store an UPPERCASED SLUG in the
 * ref_code cookie, and until PR #435 the checkout + attribution endpoints
 * resolved that cookie code-only — so orders whose first touch was
 * /partners/bach-babes were created with affiliate_id NULL and no commission.
 * The writer bug is FIXED AND DEPLOYED (merge aa1c3485, live-verified
 * 2026-09-19); this script repairs the two historical rows it left behind.
 *
 * Repair semantics: for each eligible order, call the SAME service the admin
 * "attribute past order" UI uses — linkExistingOrderToAffiliate — which, in
 * one transaction, stamps Order.affiliateId and creates an APPROVED
 * commission (APPROVED because these orders are long past their refund
 * window; the monthly payout sweep picks APPROVED rows up). No commission
 * math lives in this script.
 *
 * SAFETY INVARIANT — an order is only touched when ALL of these hold, checked
 * immediately before applying:
 *   - landing_page starts with /partners/bach-babes and affiliate_id IS NULL
 *   - status DELIVERED + financialStatus PAID + fulfillmentStatus DELIVERED
 *   - zero Refund rows and zero AffiliateCommission rows for the order
 *   - customerEmail != the affiliate's email (no self-referral ambiguity)
 *   - the BACHBABES affiliate row is ACTIVE
 * Anything else is reported NEEDS-MANUAL and left untouched (e.g. order #485,
 * CANCELLED/REFUNDED — the commission cron would have voided it, so nothing
 * is owed). Idempotent: after apply, the candidate query returns nothing.
 *
 * No Stripe access: this creates an internal commission liability only; the
 * eligibility check uses the DB's Refund rows (webhook-reconciled per
 * scripts/ops/reconcile-duplicate-refunds.mjs) rather than charging or
 * refunding anything.
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/ops/reconcile-bach-babes-attribution.ts             # dry run
 *   npx tsx scripts/ops/reconcile-bach-babes-attribution.ts --order=411 # dry run, one order
 *   npx tsx scripts/ops/reconcile-bach-babes-attribution.ts --json      # machine-readable plan
 *   npx tsx scripts/ops/reconcile-bach-babes-attribution.ts --apply     # WRITE (operator-gated)
 */

import { prisma } from '../../src/lib/database/client';
import { linkExistingOrderToAffiliate } from '../../src/lib/affiliates/manual-attribution';
import { calculateCommission } from '../../src/lib/affiliates/commission-engine';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const OUT_JSON = args.includes('--json');
const onlyFlag = args.find((a) => a.startsWith('--order='));
const ONLY_ORDER = onlyFlag ? Number(onlyFlag.split('=')[1]) : 0;

const AFFILIATE_CODE = 'BACHBABES';
const LANDING_PREFIX = '/partners/bach-babes';

interface Plan {
  orderNumber: number;
  orderId: string;
  createdAt: string;
  subtotal: number;
  action: 'BACKFILL' | 'NEEDS-MANUAL' | 'ALREADY-DONE';
  reason: string;
  projectedCommissionCents?: number;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL missing — source .env.local first.');
    process.exit(1);
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { code: AFFILIATE_CODE },
    select: { id: true, code: true, email: true, status: true },
  });
  if (!affiliate) {
    console.error(`Affiliate ${AFFILIATE_CODE} not found.`);
    process.exit(1);
  }
  if (affiliate.status !== 'ACTIVE') {
    console.error(`Affiliate ${AFFILIATE_CODE} is ${affiliate.status}, not ACTIVE — refusing.`);
    process.exit(1);
  }

  // Candidates: her landing page, never attributed. Includes ineligible rows
  // on purpose so they are REPORTED (as NEEDS-MANUAL) rather than invisible.
  const candidates = await prisma.order.findMany({
    where: {
      landingPage: { startsWith: LANDING_PREFIX },
      affiliateId: null,
      ...(ONLY_ORDER ? { orderNumber: ONLY_ORDER } : {}),
    },
    select: {
      id: true, orderNumber: true, createdAt: true, status: true,
      financialStatus: true, fulfillmentStatus: true, subtotal: true,
      discountAmount: true, customerEmail: true,
      _count: { select: { refunds: true, affiliateCommissions: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const plans: Plan[] = [];
  // Track the projected running base so the second order's tier math matches
  // what sequential linkExistingOrderToAffiliate calls will produce.
  let simulatedExtraBaseCents = 0;

  for (const order of candidates) {
    const base: Plan = {
      orderNumber: order.orderNumber,
      orderId: order.id,
      createdAt: order.createdAt.toISOString(),
      subtotal: Number(order.subtotal),
      action: 'NEEDS-MANUAL',
      reason: '',
    };

    const problems: string[] = [];
    if (order.status !== 'DELIVERED') problems.push(`status=${order.status}`);
    if (order.financialStatus !== 'PAID') problems.push(`financialStatus=${order.financialStatus}`);
    if (order.fulfillmentStatus !== 'DELIVERED') problems.push(`fulfillment=${order.fulfillmentStatus}`);
    if (order._count.refunds > 0) problems.push(`${order._count.refunds} refund row(s)`);
    if (order._count.affiliateCommissions > 0) problems.push('commission already exists');
    if ((order.customerEmail || '').toLowerCase() === affiliate.email.toLowerCase()) {
      problems.push('self-referral (customer email = affiliate email)');
    }

    if (problems.length > 0) {
      base.reason = problems.join('; ') + ' — untouched (nothing owed unless you say otherwise)';
      plans.push(base);
      continue;
    }

    // Project the commission with the SAME engine the apply path uses.
    const baseCents = Math.max(
      Math.round(Number(order.subtotal) * 100) - Math.round(Number(order.discountAmount) * 100),
      0
    );
    const projected = await calculateCommission(affiliate.id, baseCents + simulatedExtraBaseCents);
    const prior = await calculateCommission(affiliate.id, simulatedExtraBaseCents);
    base.projectedCommissionCents = projected.commissionAmountCents - prior.commissionAmountCents;
    simulatedExtraBaseCents += baseCents;
    base.action = 'BACKFILL';
    base.reason = `stamp Order.affiliateId=${affiliate.code}, create APPROVED commission`;
    plans.push(base);
  }

  const toApply = plans.filter((p) => p.action === 'BACKFILL');
  const projectedTotal = toApply.reduce((s, p) => s + (p.projectedCommissionCents ?? 0), 0);

  if (OUT_JSON) {
    console.log(JSON.stringify({ apply: APPLY, affiliate: affiliate.code, plans }, null, 2));
  } else {
    console.log(`\n=== Bach Babes attribution backfill — ${APPLY ? 'APPLY' : 'DRY RUN'} ===`);
    for (const p of plans) {
      const amount = p.projectedCommissionCents != null
        ? ` → commission $${(p.projectedCommissionCents / 100).toFixed(2)}`
        : '';
      console.log(`#${p.orderNumber}  ${p.createdAt.slice(0, 10)}  $${p.subtotal.toFixed(2)}  [${p.action}] ${p.reason}${amount}`);
    }
    console.log(`\nSummary: ${toApply.length} to backfill ($${(projectedTotal / 100).toFixed(2)} commission), ` +
      `${plans.filter((p) => p.action === 'NEEDS-MANUAL').length} needs-manual, ${plans.length} candidates total.`);
  }

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply after operator approval.');
    return;
  }

  for (const p of toApply) {
    const result = await linkExistingOrderToAffiliate({
      affiliateId: affiliate.id,
      orderNumber: p.orderNumber,
    });
    if (result.alreadyAttributedTo) {
      console.log(`#${p.orderNumber}: SKIPPED — already attributed to affiliate ${result.alreadyAttributedTo}`);
      continue;
    }
    // Post-apply verification: the order must now be stamped with exactly one
    // APPROVED commission whose amount we print for the record.
    const verify = await prisma.order.findUnique({
      where: { id: p.orderId },
      select: {
        affiliateId: true,
        affiliateCommissions: { select: { id: true, status: true, commissionAmountCents: true, commissionRate: true } },
      },
    });
    const ok = verify?.affiliateId === affiliate.id
      && verify.affiliateCommissions.length === 1
      && verify.affiliateCommissions[0].status === 'APPROVED';
    console.log(
      `#${p.orderNumber}: ${ok ? 'APPLIED' : 'VERIFY-FAILED'} — affiliateId=${verify?.affiliateId}, ` +
      `commissions=${JSON.stringify(verify?.affiliateCommissions)}`
    );
    if (!ok) process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
