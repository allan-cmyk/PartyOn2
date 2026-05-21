/**
 * Accounts Payable service — Phase 1B of the Finance Director.
 *
 * Wraps the new AP columns on ReceivingInvoice (invoiceTotalCents, dueDate,
 * paidAt, paidVia) into the queries the dashboard + cron need:
 *   - listOutstanding(): unpaid invoices with aging buckets
 *   - listRecent(): all invoices regardless of paid status
 *   - markPaid(): operator action from the dashboard
 *   - updateApFields(): set invoiceTotalCents + dueDate at apply time
 *   - apSummary(): rolled-up totals for the dashboard scorecard
 */

import { prisma } from '@/lib/database/client';

export type PaidVia = 'ach' | 'check' | 'card' | 'plaid_match' | 'other';

export type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';

export interface OutstandingApRow {
  id: string;
  distributorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  appliedAt: string | null;
  status: string;
  invoiceTotalCents: number | null;
  dueDate: string | null;
  daysPastDue: number | null;
  bucket: AgingBucket;
}

export interface ApSummary {
  outstandingCount: number;
  outstandingTotalCents: number;
  pastDueCount: number;
  pastDueTotalCents: number;
  buckets: Record<AgingBucket, { count: number; totalCents: number }>;
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400_000);
}

function bucketize(daysPastDue: number | null): AgingBucket {
  if (daysPastDue === null || daysPastDue < 0) return 'current';
  if (daysPastDue <= 30) return '1-30';
  if (daysPastDue <= 60) return '31-60';
  if (daysPastDue <= 90) return '61-90';
  return '90+';
}

/**
 * Outstanding (unpaid) invoices with aging info. Sorted by most past-due
 * first so the dashboard surfaces urgent items at the top.
 */
export async function listOutstanding(): Promise<OutstandingApRow[]> {
  const rows = await prisma.receivingInvoice.findMany({
    where: {
      paidAt: null,
      status: { not: 'CANCELLED' },
    },
    orderBy: [{ dueDate: 'asc' }, { invoiceDate: 'asc' }],
  });
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return rows.map((r) => {
    const daysPastDue = r.dueDate ? diffDays(now, r.dueDate) : null;
    return {
      id: r.id,
      distributorName: r.distributorName,
      invoiceNumber: r.invoiceNumber,
      invoiceDate: r.invoiceDate?.toISOString().slice(0, 10) ?? null,
      appliedAt: r.appliedAt?.toISOString() ?? null,
      status: r.status,
      invoiceTotalCents:
        r.invoiceTotalCents !== null ? Number(r.invoiceTotalCents) : null,
      dueDate: r.dueDate?.toISOString().slice(0, 10) ?? null,
      daysPastDue,
      bucket: bucketize(daysPastDue),
    };
  });
}

export async function apSummary(): Promise<ApSummary> {
  const outstanding = await listOutstanding();
  const buckets: ApSummary['buckets'] = {
    current: { count: 0, totalCents: 0 },
    '1-30': { count: 0, totalCents: 0 },
    '31-60': { count: 0, totalCents: 0 },
    '61-90': { count: 0, totalCents: 0 },
    '90+': { count: 0, totalCents: 0 },
  };
  let outstandingTotalCents = 0;
  let pastDueCount = 0;
  let pastDueTotalCents = 0;
  for (const row of outstanding) {
    const amount = row.invoiceTotalCents ?? 0;
    outstandingTotalCents += amount;
    buckets[row.bucket].count++;
    buckets[row.bucket].totalCents += amount;
    if (row.bucket !== 'current') {
      pastDueCount++;
      pastDueTotalCents += amount;
    }
  }
  return {
    outstandingCount: outstanding.length,
    outstandingTotalCents,
    pastDueCount,
    pastDueTotalCents,
    buckets,
  };
}

export interface MarkPaidInput {
  invoiceId: string;
  paidAt?: Date;
  paidVia: PaidVia;
}

export async function markPaid(input: MarkPaidInput): Promise<void> {
  await prisma.receivingInvoice.update({
    where: { id: input.invoiceId },
    data: {
      paidAt: input.paidAt ?? new Date(),
      paidVia: input.paidVia,
    },
  });
}

export async function markUnpaid(invoiceId: string): Promise<void> {
  await prisma.receivingInvoice.update({
    where: { id: invoiceId },
    data: { paidAt: null, paidVia: null },
  });
}

export interface UpdateApFieldsInput {
  invoiceId: string;
  invoiceTotalCents?: number | null;
  dueDate?: Date | null;
}

export async function updateApFields(input: UpdateApFieldsInput): Promise<void> {
  await prisma.receivingInvoice.update({
    where: { id: input.invoiceId },
    data: {
      invoiceTotalCents:
        input.invoiceTotalCents === undefined
          ? undefined
          : input.invoiceTotalCents === null
            ? null
            : BigInt(input.invoiceTotalCents),
      dueDate: input.dueDate === undefined ? undefined : input.dueDate,
    },
  });
}
