/**
 * Matching Engine
 *
 * Priority: phone exact -> name exact (same date) -> fuzzy name (same date)
 * Manual matches always survive re-syncs.
 */

import { prisma } from '@/lib/database/client';
import { normalizeName, normalizePhone } from './sheet-parser';

interface OrderRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  delivery_date: string;
  delivery_address: unknown;
  normalized_name: string | null;
  normalized_phone: string | null;
}

export type MatchType = 'auto_phone' | 'auto_name' | 'auto_name_fuzzy';

export interface MatchResult {
  scheduleId: number;
  orderId: string;
  matchType: MatchType;
  confidence: number;
  status: 'matched' | 'needs_review';
}

export async function runMatching(): Promise<{
  matches: MatchResult[];
  unmatched: number[];
  orphanOrders: string[];
}> {
  // Unmatched schedule rows with a client name
  const scheduleRows = await prisma.boatSchedule.findMany({
    where: {
      isStale: false,
      clientName: { not: '' },
      matches: { none: {} },
    },
    select: {
      id: true,
      cruiseDate: true,
      normalizedName: true,
      normalizedPhone: true,
      clientName: true,
    },
  });

  // Unmatched Premier-delivery orders (delivery address contains marina address)
  // deliveryAddress is a Json field; cast to text for ILIKE.
  const orderRowsRaw = await prisma.$queryRaw<Array<{
    id: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    delivery_date: Date;
    delivery_address: unknown;
  }>>`
    SELECT o.id, o.customer_name, o.customer_email, o.customer_phone,
           o.delivery_date, o.delivery_address
    FROM orders o
    LEFT JOIN schedule_order_matches som ON som.order_id = o.id
    WHERE o.delivery_address::text ILIKE '%13993%'
      AND o.delivery_address::text ILIKE '%2769%'
      AND som.id IS NULL
  `;

  const orders: OrderRow[] = orderRowsRaw.map(o => ({
    id: o.id,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    delivery_date: toISODate(o.delivery_date),
    delivery_address: o.delivery_address,
    normalized_name: normalizeName(o.customer_name),
    normalized_phone: normalizePhone(o.customer_phone),
  }));

  const matches: MatchResult[] = [];
  const matchedOrderIds = new Set<string>();
  const matchedScheduleIds = new Set<number>();

  // Pass 1: Phone match
  for (const sched of scheduleRows) {
    if (matchedScheduleIds.has(sched.id) || !sched.normalizedPhone) continue;
    const phoneMatch = orders.find(
      o => !matchedOrderIds.has(o.id) && o.normalized_phone === sched.normalizedPhone,
    );
    if (phoneMatch) {
      matches.push({
        scheduleId: sched.id,
        orderId: phoneMatch.id,
        matchType: 'auto_phone',
        confidence: 0.95,
        status: 'matched',
      });
      matchedOrderIds.add(phoneMatch.id);
      matchedScheduleIds.add(sched.id);
    }
  }

  // Pass 2: Exact name + same date
  for (const sched of scheduleRows) {
    if (matchedScheduleIds.has(sched.id) || !sched.normalizedName) continue;
    const schedDate = toISODate(sched.cruiseDate);
    const nameMatches = orders.filter(
      o => !matchedOrderIds.has(o.id) &&
           o.normalized_name === sched.normalizedName &&
           o.delivery_date === schedDate,
    );
    if (nameMatches.length === 1) {
      matches.push({
        scheduleId: sched.id,
        orderId: nameMatches[0].id,
        matchType: 'auto_name',
        confidence: 0.90,
        status: 'matched',
      });
      matchedOrderIds.add(nameMatches[0].id);
      matchedScheduleIds.add(sched.id);
    } else if (nameMatches.length > 1) {
      matches.push({
        scheduleId: sched.id,
        orderId: nameMatches[0].id,
        matchType: 'auto_name',
        confidence: 0.60,
        status: 'needs_review',
      });
      matchedOrderIds.add(nameMatches[0].id);
      matchedScheduleIds.add(sched.id);
    }
  }

  // Pass 3: Fuzzy name (same date)
  for (const sched of scheduleRows) {
    if (matchedScheduleIds.has(sched.id) || !sched.normalizedName) continue;
    const schedDate = toISODate(sched.cruiseDate);
    const dateOrders = orders.filter(
      o => !matchedOrderIds.has(o.id) && o.delivery_date === schedDate,
    );
    let bestMatch: { order: OrderRow; distance: number } | null = null;

    for (const order of dateOrders) {
      if (!order.normalized_name) continue;
      const dist = levenshtein(sched.normalizedName, order.normalized_name);
      const maxLen = Math.max(sched.normalizedName.length, order.normalized_name.length);
      if (dist <= Math.ceil(maxLen * 0.3)) {
        if (!bestMatch || dist < bestMatch.distance) bestMatch = { order, distance: dist };
      }
    }

    if (bestMatch) {
      const maxLen = Math.max(
        sched.normalizedName.length,
        bestMatch.order.normalized_name!.length,
      );
      const confidence = Math.round((1 - bestMatch.distance / maxLen) * 100) / 100;
      matches.push({
        scheduleId: sched.id,
        orderId: bestMatch.order.id,
        matchType: 'auto_name_fuzzy',
        confidence,
        status: confidence >= 0.75 ? 'matched' : 'needs_review',
      });
      matchedOrderIds.add(bestMatch.order.id);
      matchedScheduleIds.add(sched.id);
    }
  }

  const unmatched = scheduleRows
    .filter(s => !matchedScheduleIds.has(s.id) && s.clientName)
    .map(s => s.id);
  const orphanOrders = orders
    .filter(o => !matchedOrderIds.has(o.id))
    .map(o => o.id);

  return { matches, unmatched, orphanOrders };
}

export async function insertMatches(matches: MatchResult[]): Promise<number> {
  let inserted = 0;
  for (const match of matches) {
    try {
      await prisma.scheduleOrderMatch.upsert({
        where: {
          scheduleId_orderId: {
            scheduleId: match.scheduleId,
            orderId: match.orderId,
          },
        },
        create: {
          scheduleId: match.scheduleId,
          orderId: match.orderId,
          matchType: match.matchType,
          matchConfidence: match.confidence,
          status: match.status,
        },
        update: {}, // Preserve existing matches (especially manual/confirmed)
      });
      inserted++;
    } catch (err) {
      console.error(
        `Failed to insert match schedule=${match.scheduleId} order=${match.orderId}:`,
        err,
      );
    }
  }
  return inserted;
}

export async function manualMatch(
  scheduleId: number,
  orderId: string,
  notes?: string,
): Promise<void> {
  await prisma.scheduleOrderMatch.upsert({
    where: {
      scheduleId_orderId: { scheduleId, orderId },
    },
    create: {
      scheduleId,
      orderId,
      matchType: 'manual',
      matchConfidence: 1.0,
      status: 'matched',
      notes: notes || null,
    },
    update: {
      matchType: 'manual',
      matchConfidence: 1.0,
      status: 'matched',
      notes: notes ?? undefined,
      matchedAt: new Date(),
    },
  });
}

export async function unmatch(scheduleId: number, orderId: string): Promise<void> {
  await prisma.scheduleOrderMatch.deleteMany({
    where: { scheduleId, orderId },
  });
}

export async function updateMatchStatus(
  scheduleId: number,
  orderId: string,
  status: string,
  notes?: string,
): Promise<void> {
  await prisma.scheduleOrderMatch.updateMany({
    where: { scheduleId, orderId },
    data: {
      status,
      notes: notes ?? undefined,
    },
  });
}

// ============================================
// Helpers
// ============================================

function toISODate(d: Date | string): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
