/**
 * Weekly delivery summary — shared data layer.
 *
 * Powers both the printable CLI script (scripts/ops/weekly-summary.mjs) and
 * the in-app /ops/weekly-summary tab via /api/ops/weekly-summary.
 *
 * Only PAID orders within the date window are included. Sub-payments that
 * share GroupOrderV2.shareCode + deliveryDate + deliveryTime are merged into
 * a single "cooler" — grouping is sacrosanct: every sub-payer belongs to
 * exactly one cooler card and never appears outside it.
 */

import { prisma } from '@/lib/database/client';
import { resolveGroupLabel } from './group-label';

export interface WeeklyItem {
  qty: number;
  title: string;
}

export interface WeeklyPayment {
  orderNumber: number;
  payer: string;
  payerDiffers: boolean;
  phone: string;
  email: string;
  items: WeeklyItem[];
  total: number;
}

export interface WeeklyManifestMatch {
  cruiseDate: string;
  timeSlot: string | null;
  boat: string | null;
  clientName: string | null;
  package: string | null;
  headcount: number | null;
  sheetTab: string | null;
  occasion: string | null;
}

export type WeeklyShortType = 'DISCO' | 'PRIVATE' | 'HOUSE';

export interface WeeklyCooler {
  key: string;
  isCooler: boolean;
  shareCode: string | null;
  deliveryDate: string;
  deliveryTime: string;
  primaryName: string;
  groupTitle: string | null;
  address: string;
  deliveryNotes: string;
  isGroup: boolean;
  source: string;
  partyType: string | null;
  extId: string | null;
  hostPhone: string;
  hostEmail: string;
  manifestMatch: WeeklyManifestMatch | null;
  payments: WeeklyPayment[];
  aggregatedItems: Array<{ title: string; qty: number }>;
  total: number;
  totalItems: number;
  uniqueSkus: number;
  isVeryLarge: boolean;
  shortType: WeeklyShortType;
  isBoatish: boolean;
}

export interface WeeklyStats {
  coolers: number;
  payments: number;
  totalRevenue: number;
  disco: number;
  privateCruise: number;
  house: number;
  veryLarge: number;
  manifestMatched: number;
  manifestMissing: number;
}

export interface WeeklySummary {
  stats: WeeklyStats;
  coolersByDate: Array<{ date: string; coolers: WeeklyCooler[]; total: number }>;
  range: { start: string; end: string; days: number };
}

const PLACEHOLDER_NAMES = new Set([
  'host',
  'party host',
  'unknown',
  '',
  'guest',
  'customer',
  'group host',
]);

const TITLE_WORDS =
  /\b(wedding|bach|bachelor|bachelorette|party|cruise|stag|hen|reunion|birthday|drinks?|delivery|order|bash|weekend|offsite|retreat)\b/i;
const ORDINAL = /\b\d{1,3}(st|nd|rd|th)\b/i;
const POSSESSIVE = /'s\b/;

function normName(s: string | null | undefined): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normPhone(s: string | null | undefined): string {
  return (s || '').replace(/\D/g, '').slice(-10);
}

function isPlaceholderName(name: string | null | undefined): boolean {
  return PLACEHOLDER_NAMES.has((name || '').trim().toLowerCase());
}

function looksLikeTitle(name: string | null | undefined): boolean {
  if (!name) return false;
  if (isPlaceholderName(name)) return true;
  if (TITLE_WORDS.test(name)) return true;
  if (ORDINAL.test(name)) return true;
  if (POSSESSIVE.test(name)) return true;
  if (/\b\w+\s+and\s+\w+\b/i.test(name) && TITLE_WORDS.test(name)) return true;
  return false;
}

/**
 * America/Chicago YYYY-MM-DD for "today".
 */
export function todayCT(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date());
}

interface BoatScheduleRow {
  cruiseDate: Date;
  timeSlot: string | null;
  boat: string;
  clientName: string;
  normalizedName: string | null;
  normalizedPhone: string | null;
  package: string | null;
  headcount: number | null;
  sheetTab: string;
  occasion: string | null;
}

function findManifestMatch(
  candidates: BoatScheduleRow[],
  args: { manifestName: string | null; payerPhone: string | null; deliveryDate: Date }
): BoatScheduleRow | null {
  const dateKey = args.deliveryDate.toISOString().slice(0, 10);
  const sameDay = candidates.filter(
    (b) => b.cruiseDate.toISOString().slice(0, 10) === dateKey
  );
  if (!sameDay.length) return null;
  const targetName = normName(args.manifestName);
  const targetPhone = normPhone(args.payerPhone);
  const byName = targetName
    ? sameDay.find((c) => {
        const cn = c.normalizedName || normName(c.clientName);
        if (!cn || !targetName) return false;
        return cn === targetName || cn.includes(targetName) || targetName.includes(cn);
      })
    : undefined;
  if (byName) return byName;
  if (targetPhone) {
    return (
      sameDay.find((c) => (c.normalizedPhone || '') === targetPhone) || null
    );
  }
  return null;
}

interface CoolerAccumulator {
  key: string;
  isCooler: boolean;
  shareCode: string | null;
  deliveryDate: string;
  deliveryTime: string;
  primaryName: string;
  address: string;
  deliveryNotes: string;
  isGroup: boolean;
  source: string;
  partyType: string | null;
  extId: string | null;
  hostPhone: string;
  hostEmail: string;
  manifestMatch: BoatScheduleRow | null;
  payments: WeeklyPayment[];
  aggregatedItems: Map<string, number>;
}

function isBoatishAccum(c: CoolerAccumulator): boolean {
  if (c.manifestMatch) return true;
  if (c.source === 'WEBHOOK') return true;
  if (c.partyType === 'BOAT') return true;
  const a = (c.address || '').toLowerCase();
  return /marina|fm 2769|farm to market 2769|premier/i.test(a);
}

function shortTypeFor(c: CoolerAccumulator): WeeklyShortType {
  if (c.manifestMatch?.sheetTab) {
    const tab = c.manifestMatch.sheetTab.toUpperCase();
    if (tab.includes('DSC')) return 'DISCO';
    if (tab.includes('PVT')) return 'PRIVATE';
  }
  if (c.source === 'WEBHOOK') return 'DISCO';
  return 'HOUSE';
}

function preferredCustomerName(c: CoolerAccumulator): string {
  if (c.manifestMatch?.clientName) return c.manifestMatch.clientName;
  if (isBoatishAccum(c)) {
    const stripped = (c.primaryName || '').trim();
    if (stripped && !looksLikeTitle(stripped) && !isPlaceholderName(stripped)) {
      return stripped;
    }
  }
  const payers = c.payments.map((p) => p.payer).filter(Boolean);
  if (!payers.length) return c.primaryName || '(no name)';

  const original = (c.primaryName || '').trim();
  if (original && !looksLikeTitle(original)) {
    const hostMatch = payers.find((p) => p.toLowerCase() === original.toLowerCase());
    if (hostMatch) {
      return payers.length > 1 ? `${hostMatch} +${payers.length - 1} more` : hostMatch;
    }
  }
  return payers.length > 1 ? `${payers[0]} +${payers.length - 1} more` : payers[0];
}

export interface GetWeeklySummaryOptions {
  startDate?: string;
  days?: number;
}

export async function getWeeklySummary(
  opts: GetWeeklySummaryOptions = {}
): Promise<WeeklySummary> {
  const startStr = opts.startDate || todayCT();
  const days = Math.max(1, Math.min(30, opts.days ?? 7));

  const startDate = new Date(`${startStr}T00:00:00.000Z`);
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + days);

  const [confirmed, boatScheduleEntries] = await Promise.all([
    prisma.order.findMany({
      where: {
        deliveryDate: { gte: startDate, lt: endDate },
        status: { in: ['CONFIRMED', 'PENDING'] },
        financialStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
      },
      include: {
        items: { select: { quantity: true, title: true } },
        groupOrderV2: {
          select: {
            id: true,
            name: true,
            hostName: true,
            hostPhone: true,
            hostEmail: true,
            shareCode: true,
            source: true,
            partyType: true,
            externalBookingId: true,
          },
        },
      },
      orderBy: { deliveryDate: 'asc' },
    }),
    prisma.boatSchedule.findMany({
      where: {
        cruiseDate: { gte: startDate, lt: endDate },
        isStale: false,
        clientName: { not: '' },
      },
      select: {
        cruiseDate: true,
        timeSlot: true,
        boat: true,
        clientName: true,
        normalizedName: true,
        normalizedPhone: true,
        package: true,
        headcount: true,
        sheetTab: true,
        occasion: true,
      },
    }),
  ]);

  const rows = confirmed.map((o) => {
    const lbl = resolveGroupLabel(o.groupOrderV2, o.customerName);
    const addr = (o.deliveryAddress || {}) as {
      address1?: string;
      city?: string;
      zip?: string;
    };
    const items: WeeklyItem[] = o.items.map((i) => ({
      qty: i.quantity,
      title: i.title,
    }));
    const manifestMatch = lbl.isGroupOrder
      ? findManifestMatch(boatScheduleEntries, {
          manifestName: lbl.manifestName || o.customerName,
          payerPhone: o.customerPhone,
          deliveryDate: o.deliveryDate,
        })
      : null;
    return {
      orderId: o.id,
      orderNumber: o.orderNumber,
      deliveryDate: o.deliveryDate.toISOString().slice(0, 10),
      deliveryTime: o.deliveryTime || 'TBD',
      primaryName: lbl.displayLabel,
      payer: o.customerName,
      payerDiffers: lbl.payerDiffers,
      phone: o.customerPhone || '',
      email: o.customerEmail || '',
      address: [addr.address1, addr.city, addr.zip].filter(Boolean).join(', '),
      deliveryNotes: o.deliveryInstructions || '',
      isGroup: lbl.isGroupOrder,
      source: o.groupOrderV2?.source || 'DIRECT',
      partyType: o.groupOrderV2?.partyType || null,
      extId: o.groupOrderV2?.externalBookingId || null,
      shareCode: lbl.shareCode,
      hostPhone: o.groupOrderV2?.hostPhone || '',
      hostEmail: o.groupOrderV2?.hostEmail || '',
      total: Number(o.total),
      items,
      manifestMatch,
    };
  });

  // Grouping invariant: shareCode + date + time => one cooler.
  // Solo orders without a shareCode get a unique key based on orderId.
  const coolerMap = new Map<string, CoolerAccumulator>();
  for (const r of rows) {
    const key = r.shareCode
      ? `g:${r.shareCode}|${r.deliveryDate}|${r.deliveryTime}`
      : `s:${r.orderId}`;
    if (!coolerMap.has(key)) {
      coolerMap.set(key, {
        key,
        isCooler: !!r.shareCode,
        shareCode: r.shareCode,
        deliveryDate: r.deliveryDate,
        deliveryTime: r.deliveryTime,
        primaryName: r.primaryName,
        address: r.address,
        deliveryNotes: r.deliveryNotes,
        isGroup: r.isGroup,
        source: r.source,
        partyType: r.partyType,
        extId: r.extId,
        hostPhone: r.hostPhone || r.phone,
        hostEmail: r.hostEmail || r.email,
        manifestMatch: r.manifestMatch,
        payments: [],
        aggregatedItems: new Map(),
      });
    }
    const c = coolerMap.get(key)!;
    c.payments.push({
      orderNumber: r.orderNumber,
      payer: r.payer,
      payerDiffers: r.payerDiffers,
      phone: r.phone,
      email: r.email,
      items: r.items,
      total: r.total,
    });
    for (const it of r.items) {
      c.aggregatedItems.set(it.title, (c.aggregatedItems.get(it.title) || 0) + it.qty);
    }
    if (!c.deliveryNotes && r.deliveryNotes) c.deliveryNotes = r.deliveryNotes;
  }

  const coolers: WeeklyCooler[] = [...coolerMap.values()].map((c) => {
    const total = c.payments.reduce((s, p) => s + p.total, 0);
    const totalItems = [...c.aggregatedItems.values()].reduce((s, q) => s + q, 0);
    const isVeryLarge = total >= 500 || totalItems >= 15;
    const groupTitle =
      c.primaryName && !isPlaceholderName(c.primaryName) && c.primaryName !== preferredCustomerName(c)
        ? c.primaryName
        : null;
    const displayName = preferredCustomerName(c);
    const aggregatedItems = [...c.aggregatedItems.entries()]
      .map(([title, qty]) => ({ title, qty }))
      .sort((a, b) => b.qty - a.qty || a.title.localeCompare(b.title));

    const manifestMatch: WeeklyManifestMatch | null = c.manifestMatch
      ? {
          cruiseDate: c.manifestMatch.cruiseDate.toISOString().slice(0, 10),
          timeSlot: c.manifestMatch.timeSlot || null,
          boat: c.manifestMatch.boat || null,
          clientName: c.manifestMatch.clientName || null,
          package: c.manifestMatch.package || null,
          headcount: c.manifestMatch.headcount ?? null,
          sheetTab: c.manifestMatch.sheetTab || null,
          occasion: c.manifestMatch.occasion || null,
        }
      : null;

    return {
      key: c.key,
      isCooler: c.isCooler,
      shareCode: c.shareCode,
      deliveryDate: c.deliveryDate,
      deliveryTime: c.deliveryTime,
      primaryName: displayName,
      groupTitle,
      address: c.address,
      deliveryNotes: c.deliveryNotes,
      isGroup: c.isGroup,
      source: c.source,
      partyType: c.partyType,
      extId: c.extId,
      hostPhone: c.hostPhone,
      hostEmail: c.hostEmail,
      manifestMatch,
      payments: c.payments,
      aggregatedItems,
      total,
      totalItems,
      uniqueSkus: aggregatedItems.length,
      isVeryLarge,
      shortType: shortTypeFor(c),
      isBoatish: isBoatishAccum(c),
    };
  });

  coolers.sort(
    (a, b) =>
      a.deliveryDate.localeCompare(b.deliveryDate) ||
      (a.deliveryTime || '').localeCompare(b.deliveryTime || '')
  );

  const stats: WeeklyStats = {
    coolers: coolers.length,
    payments: coolers.reduce((s, c) => s + c.payments.length, 0),
    totalRevenue: coolers.reduce((s, c) => s + c.total, 0),
    disco: coolers.filter((c) => c.shortType === 'DISCO').length,
    privateCruise: coolers.filter((c) => c.shortType === 'PRIVATE').length,
    house: coolers.filter((c) => c.shortType === 'HOUSE').length,
    veryLarge: coolers.filter((c) => c.isVeryLarge).length,
    manifestMatched: coolers.filter((c) => c.isBoatish && c.manifestMatch).length,
    manifestMissing: coolers.filter((c) => c.isBoatish && !c.manifestMatch).length,
  };

  const byDateMap = new Map<string, WeeklyCooler[]>();
  for (const c of coolers) {
    if (!byDateMap.has(c.deliveryDate)) byDateMap.set(c.deliveryDate, []);
    byDateMap.get(c.deliveryDate)!.push(c);
  }
  const coolersByDate = [...byDateMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, list]) => ({
      date,
      coolers: list,
      total: list.reduce((s, c) => s + c.total, 0),
    }));

  return {
    stats,
    coolersByDate,
    range: {
      start: startStr,
      end: new Date(endDate.getTime() - 86_400_000).toISOString().slice(0, 10),
      days,
    },
  };
}
