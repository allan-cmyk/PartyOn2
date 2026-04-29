#!/usr/bin/env node
/**
 * Weekly Order Summary — printable HTML checklist of definitely-placed (paid)
 * deliveries for a 7-day window.
 *
 * Usage:
 *   node scripts/ops/weekly-summary.mjs [start-date] [--days=7] [--out=path.html]
 *
 *   start-date    YYYY-MM-DD (defaults to today, America/Chicago)
 *   --days=N      Window length in days (default 7)
 *   --out=PATH    Output HTML path (default ./weekly-summary.html)
 *
 * Behavior:
 *   - Only PAID orders (Order.financialStatus = PAID, fulfillmentStatus = UNFULFILLED).
 *   - Sub-payments under the same group dashboard sharing a delivery slot are
 *     merged into a single "cooler card" with aggregated items + per-payer breakdown.
 *   - Boat / Disco orders are cross-referenced against the BoatSchedule (Premier
 *     manifest source-of-truth) and flagged ✅ matched or ⚠ not on manifest.
 *   - Each card carries: AM/PM/EVE pill, optional "Very large" pill (≥ $500 OR
 *     ≥ 15 items), "Private" pill for non-group orders, type tag (Disco/Boat/etc).
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { resolveGroupLabel } from './_group-label.mjs';

const prisma = new PrismaClient();

// ----- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);
const positional = args.filter((a) => !a.startsWith('--'));

function todayCT() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date()); // YYYY-MM-DD
}

const startDateStr = positional[0] || todayCT();
const days = parseInt(flags.days ?? '7', 10);
const outPath =
  flags.out || path.join(process.cwd(), 'weekly-summary.html');

const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
const endDate = new Date(startDate);
endDate.setUTCDate(startDate.getUTCDate() + days);

// ----- queries --------------------------------------------------------------

const confirmed = await prisma.order.findMany({
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
});

// Boat schedule for cross-referencing
const boatScheduleEntries = await prisma.boatSchedule.findMany({
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
});

function normName(s) {
  return (s || '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
}
function normPhone(s) {
  return (s || '').replace(/\D/g, '').slice(-10);
}

function findManifestMatch({ manifestName, payerPhone, deliveryDate }) {
  const dateKey = deliveryDate.toISOString().slice(0, 10);
  const candidates = boatScheduleEntries.filter(
    (b) => b.cruiseDate.toISOString().slice(0, 10) === dateKey
  );
  if (!candidates.length) return null;
  const targetName = normName(manifestName);
  const targetPhone = normPhone(payerPhone);
  // Try name match first, then phone
  const byName = targetName
    ? candidates.find((c) => {
        const cn = c.normalizedName || normName(c.clientName);
        if (!cn || !targetName) return false;
        return cn === targetName || cn.includes(targetName) || targetName.includes(cn);
      })
    : null;
  if (byName) return byName;
  if (targetPhone) {
    return (
      candidates.find((c) => (c.normalizedPhone || normPhone(c.clientPhone)) === targetPhone) ||
      null
    );
  }
  return null;
}

// ----- normalize confirmed orders ------------------------------------------

const rows = confirmed.map((o) => {
  const lbl = resolveGroupLabel(o.groupOrderV2, o.customerName);
  const addr = o.deliveryAddress || {};
  const items = o.items.map((i) => ({ qty: i.quantity, title: i.title }));
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const manifestMatch = lbl.isGroupOrder
    ? findManifestMatch({
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
    deliveryNotes: o.deliveryNotes || '',
    isGroup: lbl.isGroupOrder,
    source: o.groupOrderV2?.source || 'DIRECT',
    partyType: o.groupOrderV2?.partyType || null,
    extId: o.groupOrderV2?.externalBookingId || null,
    shareCode: lbl.shareCode,
    hostPhone: o.groupOrderV2?.hostPhone || '',
    hostEmail: o.groupOrderV2?.hostEmail || '',
    total: Number(o.total),
    items,
    totalItems,
    manifestMatch,
  };
});

// ----- group into "coolers" -------------------------------------------------
// Same shareCode + deliveryDate + deliveryTime ⇒ one cooler card.
// Solo orders without a shareCode become single-payer coolers.

const coolerMap = new Map();
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
  const c = coolerMap.get(key);
  c.payments.push({
    orderNumber: r.orderNumber,
    payer: r.payer,
    payerDiffers: r.payerDiffers,
    phone: r.phone,
    email: r.email,
    items: r.items,
    total: r.total,
  });
  // Aggregate items
  for (const it of r.items) {
    c.aggregatedItems.set(
      it.title,
      (c.aggregatedItems.get(it.title) || 0) + it.qty
    );
  }
  // Pull deliveryNotes from any payment that has it, if cooler doesn't yet
  if (!c.deliveryNotes && r.deliveryNotes) c.deliveryNotes = r.deliveryNotes;
}

// Names that mean "no real customer name was set"
const PLACEHOLDER_NAMES = new Set([
  'host', 'party host', 'unknown', '', 'guest', 'customer', 'group host',
]);

function isPlaceholderName(name) {
  return PLACEHOLDER_NAMES.has((name || '').trim().toLowerCase());
}

// Heuristics: words that indicate this is a party / event title rather than a
// person's name. We never use these as the cooler header; the actual paying
// customer's name goes there instead.
const TITLE_WORDS = /\b(wedding|bach|bachelor|bachelorette|party|cruise|stag|hen|reunion|birthday|drinks?|delivery|order|bash|weekend|offsite|retreat)\b/i;
const ORDINAL = /\b\d{1,3}(st|nd|rd|th)\b/i;
const POSSESSIVE = /'s\b/;

function looksLikeTitle(name) {
  if (!name) return false;
  if (isPlaceholderName(name)) return true;
  if (TITLE_WORDS.test(name)) return true;
  if (ORDINAL.test(name)) return true;
  if (POSSESSIVE.test(name)) return true;
  // "X and Y Wedding/etc" — the "and" + capitalized-pair pattern
  if (/\b\w+\s+and\s+\w+\b/i.test(name) && TITLE_WORDS.test(name)) return true;
  return false;
}

function isBoatCooler(c) {
  if (c.manifestMatch) return true;
  if (c.source === 'WEBHOOK') return true;
  if (c.partyType === 'BOAT') return true;
  const a = (c.address || '').toLowerCase();
  return /marina|fm 2769|farm to market 2769|premier/i.test(a);
}

function preferredCustomerName(cooler) {
  // BOAT ORDERS — the manifest is source-of-truth.  Whoever booked the boat
  // is the customer; every payer is a sub-order under their cruise.
  if (cooler.manifestMatch?.clientName) {
    return cooler.manifestMatch.clientName;
  }
  if (isBoatCooler(cooler)) {
    // No matched manifest entry (e.g. Disco webhook synced before sheet refresh)
    // — fall back to the dashboard name when it looks like a real person.
    const stripped = (cooler.primaryName || '').trim();
    if (stripped && !looksLikeTitle(stripped) && !isPlaceholderName(stripped)) {
      return stripped;
    }
  }

  // NON-BOAT — show the actual paying customer.
  const payers = cooler.payments.map((p) => p.payer).filter(Boolean);
  if (!payers.length) return cooler.primaryName || '(no name)';

  // If the resolved dashboard name is itself a real person AND that person is
  // one of the payers (host paid for their own group), prefer the host.
  const original = (cooler.primaryName || '').trim();
  if (original && !looksLikeTitle(original)) {
    const hostMatch = payers.find((p) => p.toLowerCase() === original.toLowerCase());
    if (hostMatch) {
      return payers.length > 1 ? `${hostMatch} +${payers.length - 1} more` : hostMatch;
    }
  }
  return payers.length > 1 ? `${payers[0]} +${payers.length - 1} more` : payers[0];
}

const coolers = [...coolerMap.values()].map((c) => {
  const total = c.payments.reduce((s, p) => s + p.total, 0);
  const totalItems = [...c.aggregatedItems.values()].reduce((s, q) => s + q, 0);
  const isVeryLarge = total >= 500 || totalItems >= 15;
  const isPrivate = !c.isGroup;
  // Preserve the original group / cruise title so we can show it as supplementary
  // context beneath the customer name in the banner.
  const groupTitle =
    c.primaryName && !isPlaceholderName(c.primaryName) && c.primaryName !== preferredCustomerName(c)
      ? c.primaryName
      : null;
  const displayName = preferredCustomerName(c);
  return { ...c, primaryName: displayName, groupTitle, total, totalItems, isVeryLarge, isPrivate };
});

// Sort by date asc, time asc
coolers.sort(
  (a, b) =>
    a.deliveryDate.localeCompare(b.deliveryDate) ||
    (a.deliveryTime || '').localeCompare(b.deliveryTime || '')
);

await prisma.$disconnect();

// ----- helpers --------------------------------------------------------------

function timeOfDayPill(timeStr) {
  if (!timeStr || timeStr === 'TBD') return { label: 'TBD', cls: 'pill-tbd' };
  const m = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return { label: '?', cls: 'pill-tbd' };
  let hour = parseInt(m[1], 10);
  const isPM = m[3].toUpperCase() === 'PM';
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  if (hour < 12) return { label: 'AM', cls: 'pill-am' };
  if (hour < 17) return { label: 'PM', cls: 'pill-pm' };
  return { label: 'EVE', cls: 'pill-eve' };
}

function typeTag(c) {
  if (!c.isGroup) return { label: 'Private', cls: 'tag-private' };
  // Boat manifest is the source of truth for cruise type — promote DSC/PVT to
  // the top tag whenever a match exists, regardless of how the dashboard was
  // created (DIRECT, PARTNER_PAGE, or WEBHOOK).
  if (c.manifestMatch?.sheetTab) {
    const tab = c.manifestMatch.sheetTab.toUpperCase();
    if (tab.includes('DSC')) return { label: 'Disco Cruise', cls: 'tag-disco' };
    if (tab.includes('PVT')) return { label: 'Private Cruise', cls: 'tag-pvt' };
  }
  if (c.source === 'WEBHOOK') return { label: 'Disco · Premier', cls: 'tag-disco' };
  if (c.source === 'PARTNER_PAGE') return { label: 'Partner page', cls: 'tag-partner' };
  if (c.partyType === 'BOAT') return { label: 'Group · Boat', cls: 'tag-boat' };
  if (['BACH', 'BACHELOR', 'BACHELORETTE'].includes(c.partyType))
    return { label: 'Group · Bach', cls: 'tag-group' };
  if (c.partyType === 'WEDDING') return { label: 'Group · Wedding', cls: 'tag-group' };
  if (c.partyType === 'HOUSE_PARTY') return { label: 'Group · House', cls: 'tag-group' };
  if (c.partyType === 'CORPORATE') return { label: 'Group · Corp', cls: 'tag-group' };
  return { label: 'Group', cls: 'tag-group' };
}

function isBoatish(c) {
  if (c.source === 'WEBHOOK') return true;
  if (c.partyType === 'BOAT') return true;
  const a = (c.address || '').toLowerCase();
  return /marina|fm 2769|farm to market 2769|premier/i.test(a);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAY_NAMES[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
function fmtDateShort(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAY_NAMES_SHORT[d.getUTCDay()]} ${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function shortType(c) {
  // For label printing: Disco / Private for boat orders; otherwise the party
  // type. Always returns a short, label-friendly word.
  if (c.manifestMatch?.sheetTab) {
    const tab = c.manifestMatch.sheetTab.toUpperCase();
    if (tab.includes('DSC')) return 'DISCO';
    if (tab.includes('PVT')) return 'PRIVATE';
  }
  if (!c.isGroup) return 'PRIVATE';
  if (c.source === 'WEBHOOK') return 'DISCO';
  if (c.partyType === 'BOAT') return 'BOAT';
  if (['BACH', 'BACHELOR', 'BACHELORETTE'].includes(c.partyType)) return 'BACH';
  if (c.partyType === 'WEDDING') return 'WEDDING';
  if (c.partyType === 'HOUSE_PARTY') return 'HOUSE';
  if (c.partyType === 'CORPORATE') return 'CORP';
  return 'GROUP';
}

// ----- summary tallies ------------------------------------------------------

const stats = {
  coolers: coolers.length,
  payments: coolers.reduce((s, c) => s + c.payments.length, 0),
  totalRevenue: coolers.reduce((s, c) => s + c.total, 0),
  disco: coolers.filter((c) => c.source === 'WEBHOOK').length,
  groupCoolers: coolers.filter((c) => c.isGroup && c.source !== 'WEBHOOK').length,
  privateCount: coolers.filter((c) => !c.isGroup).length,
  veryLarge: coolers.filter((c) => c.isVeryLarge).length,
  manifestMatched: coolers.filter((c) => isBoatish(c) && c.manifestMatch).length,
  manifestMissing: coolers.filter((c) => isBoatish(c) && !c.manifestMatch).length,
};

// ----- group by date for layout --------------------------------------------

const byDate = new Map();
for (const c of coolers) {
  if (!byDate.has(c.deliveryDate)) byDate.set(c.deliveryDate, []);
  byDate.get(c.deliveryDate).push(c);
}

// ----- HTML render ----------------------------------------------------------

const css = `
  * { box-sizing: border-box; }
  body { font: 12px/1.35 'Inter', system-ui, -apple-system, sans-serif; color: #111; margin: 0; padding: 18px 24px; background: #fff; }
  h1 { font-size: 20px; margin: 0 0 2px; letter-spacing: 0.04em; text-transform: uppercase; }
  .subhead { color: #555; margin-bottom: 6px; font-size: 11px; }
  .legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 10px; color: #555; margin-bottom: 10px; align-items: center; }
  .legend-swatch { display: inline-block; width: 14px; height: 14px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
  .legend-swatch.lg { background: #d97706; }
  .legend-swatch.pv { background: #6b7280; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; padding: 8px 12px; background: #f6f6f4; border: 1px solid #e6e6e1; border-radius: 6px; margin-bottom: 14px; font-size: 10px; }
  .summary > div { display: flex; flex-direction: column; }
  .summary b { font-size: 15px; color: #0B74B8; }
  .day-section { margin-bottom: 14px; page-break-inside: auto; }
  .day-header { font-size: 14px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 6px 10px; background: #0B74B8; color: #fff; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between; break-after: avoid; }
  .day-count { font-weight: 400; opacity: 0.85; font-size: 11px; }
  .cooler { border: 1px solid #ddd; border-top: 0; page-break-inside: avoid; break-inside: avoid; }
  .cooler.flag-large { border-left: 4px solid #d97706; }
  .cooler.flag-private { border-left: 4px solid #6b7280; }
  .cooler.flag-large.flag-private { border-left: 4px solid #d97706; box-shadow: inset 4px 0 0 #6b7280; }
  .cooler-banner { background: #f3f4f6; padding: 6px 10px 5px; border-bottom: 2px solid #d4d4d4; }
  .cooler-banner.has-large { background: linear-gradient(90deg, #fff7ed 0%, #f3f4f6 100%); }
  .cooler-banner.has-private { background: linear-gradient(90deg, #f3f4f6 0%, #f9fafb 100%); }
  .cooler-name { font-size: 16px; font-weight: 800; letter-spacing: 0.02em; color: #111; line-height: 1.15; margin: 3px 0 1px; display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .cooler-name .check { width: 18px; height: 18px; border: 2.5px solid #111; border-radius: 3px; display: inline-block; vertical-align: middle; margin-right: 4px; flex-shrink: 0; align-self: center; }
  .cooler-subname { font-size: 10px; color: #555; margin: 0 0 3px 26px; font-style: italic; }
  .cooler-subname b { font-style: normal; color: #444; font-weight: 600; }
  .label-line { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: #0B74B8; text-transform: uppercase; font-family: 'SF Mono', 'Menlo', Monaco, monospace; line-height: 1.2; margin-left: auto; }
  .label-line .lbl-sep { color: #9ca3af; margin: 0 4px; }
  .label-line .lbl-disco { color: #c2410c; }
  .label-line .lbl-pvt { color: #0f766e; }
  .label-line .lbl-priv { color: #1f2937; }
  .cooler-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 10px; padding: 7px 10px 8px; }
  .col-left { min-width: 0; display: flex; flex-direction: column; }
  .col-right { min-width: 0; display: flex; flex-direction: column; }
  .cooler-head { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
  .pill { display: inline-block; padding: 1px 6px; border-radius: 9px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
  .pill-am { background: #fde68a; color: #92400e; }
  .pill-pm { background: #bfdbfe; color: #1e40af; }
  .pill-eve { background: #312e81; color: #fff; }
  .pill-tbd { background: #e5e7eb; color: #374151; }
  .pill-large { background: #fed7aa; color: #9a3412; border: 1px solid #fb923c; }
  .pill-private { background: #f3f4f6; color: #374151; border: 1px solid #9ca3af; }
  .time { font-weight: 700; font-size: 12px; color: #111; }
  .tag { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; line-height: 1.1; }
  .tag-disco { background: #f97316; color: #fff; box-shadow: 0 0 0 1px #c2410c inset; }
  .tag-pvt { background: #0d9488; color: #fff; box-shadow: 0 0 0 1px #0f766e inset; }
  .tag-partner { background: #dbeafe; color: #1e3a8a; box-shadow: 0 0 0 1px #3b82f6 inset; }
  .tag-group { background: #f0e8d8; color: #6e5a1f; box-shadow: 0 0 0 1px #b08940 inset; }
  .tag-boat { background: #cffafe; color: #0e7490; box-shadow: 0 0 0 1px #0891b2 inset; }
  .tag-private { background: #1f2937; color: #fde68a; box-shadow: 0 0 0 1px #111 inset; }
  .ord-num { color: #888; font-size: 9px; }
  .meta { font-size: 10.5px; color: #444; margin: 1px 0; line-height: 1.3; }
  .meta a { color: #0B74B8; text-decoration: none; }
  .manifest-line { font-size: 10px; padding: 3px 6px; border-radius: 3px; margin: 3px 0; line-height: 1.3; }
  .manifest-ok { background: #dcfce7; color: #166534; }
  .manifest-miss { background: #fee2e2; color: #991b1b; font-weight: 600; }
  .items-block h4 { margin: 0 0 3px; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #0B74B8; }
  .items ul { margin: 1px 0; padding-left: 14px; font-size: 11px; line-height: 1.3; }
  .items li { margin: 0; }
  .sub-orders { margin-top: 6px; padding-top: 5px; border-top: 1px solid #e6e6e1; }
  .sub-orders h4 { margin: 0 0 4px; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #0B74B8; }
  .sub-order-card { border: 1px solid #d4d4d4; border-left: 3px solid #0B74B8; border-radius: 3px; padding: 4px 7px; margin-bottom: 4px; background: #fff; page-break-inside: avoid; break-inside: avoid; }
  .sub-order-card:last-child { margin-bottom: 0; }
  .sub-order-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1px; gap: 8px; }
  .sub-order-name { font-size: 12px; font-weight: 700; color: #111; letter-spacing: 0.01em; }
  .sub-order-name .for-label { font-size: 8px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-right: 4px; }
  .sub-order-total { font-size: 11px; font-weight: 700; color: #0B74B8; white-space: nowrap; }
  .sub-order-contact { font-size: 10px; color: #555; margin: 1px 0 2px; }
  .sub-order-items { font-size: 10px; color: #222; margin: 1px 0 0; padding-left: 14px; list-style: disc; line-height: 1.3; }
  .sub-order-items li { margin: 0; }
  .single-contact { font-size: 10.5px; color: #555; margin: 2px 0 0; }
  .total-row { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; padding-top: 5px; border-top: 2px solid #0B74B8; font-weight: 700; font-size: 12px; }
  .check { width: 16px; height: 16px; border: 2px solid #333; border-radius: 3px; display: inline-block; vertical-align: middle; margin-right: 6px; }
  .notes { background: #fef3c7; border-left: 3px solid #d97706; padding: 4px 6px; margin: 3px 0; font-size: 10px; }
  @media print {
    body { padding: 10px 14px; font-size: 10px; }
    .cooler { break-inside: avoid; }
    .sub-order-card { break-inside: avoid; }
    .summary { break-inside: avoid; }
    .day-header { break-after: avoid; }
  }
`;

let html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Weekly Delivery Checklist · ${esc(fmtDate(coolers[0]?.deliveryDate || startDateStr))} – ${esc(fmtDate(coolers[coolers.length - 1]?.deliveryDate || startDateStr))}</title>
  <style>${css}</style>
</head>
<body>
<h1>Weekly Delivery Checklist</h1>
<div class="subhead">${esc(fmtDate(startDateStr))} – ${esc(fmtDate(new Date(endDate.getTime() - 86400000).toISOString().slice(0, 10)))} · paid orders only · printed ${esc(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))} CT</div>
<div class="legend">
  <span><span class="legend-swatch lg"></span>Orange left border = Very large (≥ $500 or ≥ 15 items)</span>
  <span><span class="legend-swatch pv"></span>Gray left border = Private (non-group)</span>
  <span><span class="tag tag-disco" style="font-size:9px;padding:1px 6px;">Disco Cruise</span> = boat manifest sheet ends in DSC (Premier disco shuttle)</span>
  <span><span class="tag tag-pvt" style="font-size:9px;padding:1px 6px;">Private Cruise</span> = boat manifest sheet ends in PVT (private charter)</span>
  <span><span class="tag tag-private" style="font-size:9px;padding:1px 6px;">Private</span> = solo customer (no group dashboard)</span>
</div>
<div class="summary">
  <div><b>${stats.coolers}</b>Total coolers</div>
  <div><b>${stats.payments}</b>Sub-payments</div>
  <div><b>$${stats.totalRevenue.toFixed(2)}</b>Gross revenue</div>
  <div><b>${stats.disco}</b>Disco cruises</div>
  <div><b>${stats.groupCoolers}</b>Group coolers</div>
  <div><b>${stats.privateCount}</b>Private orders</div>
  <div><b>${stats.veryLarge}</b>Very-large flags</div>
  <div><b>${stats.manifestMatched} / ${stats.manifestMatched + stats.manifestMissing}</b>Boat manifest matches</div>
</div>
`;

for (const date of [...byDate.keys()].sort()) {
  const list = byDate.get(date);
  const dayTotal = list.reduce((s, c) => s + c.total, 0);
  html += `<section class="day-section">
    <div class="day-header">${esc(fmtDate(date))} <span class="day-count">${list.length} cooler${list.length === 1 ? '' : 's'} · $${dayTotal.toFixed(2)}</span></div>`;

  for (const c of list) {
    const pill = timeOfDayPill(c.deliveryTime);
    const tag = typeTag(c);
    const flagLarge = c.isVeryLarge ? `<span class="pill pill-large">VERY LARGE</span>` : '';
    const flagPrivate = c.isPrivate ? `<span class="pill pill-private">PRIVATE</span>` : '';
    const flagClasses = [c.isVeryLarge ? 'flag-large' : '', c.isPrivate ? 'flag-private' : '']
      .filter(Boolean)
      .join(' ');
    const groupCode = c.shareCode
      ? `<span class="ord-num">code ${esc(c.shareCode)}${c.extId ? ' · Premier#' + esc(c.extId).slice(0, 12) : ''}</span>`
      : '';

    let manifestLine = '';
    if (isBoatish(c)) {
      if (c.manifestMatch) {
        const m = c.manifestMatch;
        const cruiseHost = m.clientName ? `Cruise host: <b>${esc(m.clientName)}</b> · ` : '';
        manifestLine = `<div class="manifest-line manifest-ok">✓ Boat manifest match — ${cruiseHost}<b>${esc(m.boat || '?')}</b> · ${esc(m.timeSlot || '?')}${m.package ? ' · ' + esc(m.package) : ''}${m.headcount ? ' · ' + m.headcount + ' guests' : ''}${m.sheetTab ? ' · ' + esc(m.sheetTab) : ''}</div>`;
      } else {
        manifestLine = `<div class="manifest-line manifest-miss">⚠ NOT FOUND on boat manifest — verify before loading</div>`;
      }
    }

    const aggItems = [...c.aggregatedItems.entries()].map(
      ([title, qty]) => `<li>${qty}× ${esc(title)}</li>`
    ).join('');

    // Show sub-orders whenever there are multiple payers OR the single payer's
    // name differs from the cooler header (e.g. Michelle McNeil's cooler has
    // Ramya Pokala as the single sub-order beneath her cruise).
    const headerBase = c.primaryName.replace(/\s*\+\d+\s*more$/i, '').trim().toLowerCase();
    const onlyPayerName = c.payments.length === 1 ? (c.payments[0].payer || '').trim().toLowerCase() : null;
    const showSubOrders =
      c.payments.length > 1 || (onlyPayerName && onlyPayerName !== headerBase);

    let subOrdersHtml = '';
    let singleContactHtml = '';
    if (showSubOrders) {
      const cards = c.payments.map((p) => {
        const items = p.items.map((i) => `<li>${i.qty}× ${esc(i.title)}</li>`).join('');
        const contact = [p.phone, p.email].filter(Boolean).map(esc).join(' · ');
        const orderNum = p.orderNumber ? `<span class="ord-num">#${p.orderNumber}</span>` : '';
        return `<div class="sub-order-card">
          <div class="sub-order-head">
            <div class="sub-order-name"><span class="for-label">Paid by</span>${esc(p.payer)} ${orderNum}</div>
            <div class="sub-order-total">$${p.total.toFixed(2)}</div>
          </div>
          ${contact ? `<div class="sub-order-contact">☎ ${contact}</div>` : ''}
          <ul class="sub-order-items">${items}</ul>
        </div>`;
      }).join('');
      const heading = c.payments.length === 1
        ? 'Sub-order (1 payer)'
        : `Sub-orders (${c.payments.length} payers)`;
      subOrdersHtml = `<div class="sub-orders">
        <h4>${heading}</h4>
        ${cards}
      </div>`;
    } else {
      const p = c.payments[0];
      const contact = [p.phone, p.email].filter(Boolean).map(esc).join(' · ');
      if (contact) {
        singleContactHtml = `<div class="single-contact">☎ ${contact}</div>`;
      }
    }

    const notesHtml = c.deliveryNotes
      ? `<div class="notes"><b>Notes:</b> ${esc(c.deliveryNotes)}</div>`
      : '';

    const hostContact = [c.hostPhone, c.hostEmail].filter(Boolean).map(esc).join(' · ');

    const bannerCls = [
      'cooler-banner',
      c.isVeryLarge ? 'has-large' : '',
      c.isPrivate ? 'has-private' : '',
    ].filter(Boolean).join(' ');

    html += `<div class="cooler ${flagClasses}">
      <div class="${bannerCls}">
        <div class="cooler-head">
          <span class="pill ${pill.cls}">${pill.label}</span>
          <span class="time">${esc(c.deliveryTime)}</span>
          <span class="tag ${tag.cls}">${esc(tag.label)}</span>
          ${flagLarge}
          ${flagPrivate}
          ${groupCode}
        </div>
        <div class="cooler-name">
          <span class="check"></span>
          <span>${esc(c.primaryName)}</span>
          ${(() => {
            const t = shortType(c);
            const tCls = t === 'DISCO' ? 'lbl-disco' : t === 'PRIVATE' && isBoatCooler(c) ? 'lbl-pvt' : t === 'PRIVATE' ? 'lbl-priv' : '';
            return `<span class="label-line">${esc(fmtDateShort(c.deliveryDate))}<span class="lbl-sep">·</span>${pill.label}<span class="lbl-sep">·</span><span class="${tCls}">${t}</span></span>`;
          })()}
        </div>
        ${c.groupTitle ? `<div class="cooler-subname"><b>Group:</b> ${esc(c.groupTitle)}</div>` : ''}
      </div>
      <div class="cooler-body">
        <div class="col-left">
          ${manifestLine}
          <div class="meta">📍 ${esc(c.address || 'No address')}</div>
          ${hostContact ? `<div class="meta">👤 ${hostContact}</div>` : ''}
          ${singleContactHtml}
          ${notesHtml}
          ${subOrdersHtml}
          <div class="total-row">
            <span>Order total</span>
            <span>$${c.total.toFixed(2)}</span>
          </div>
        </div>
        <div class="col-right">
          <div class="items-block">
            <h4>Cooler contents · ${c.totalItems} items · ${c.aggregatedItems.size} SKUs</h4>
            <div class="items"><ul>${aggItems}</ul></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  html += `</section>`;
}

html += `</body></html>`;

fs.writeFileSync(outPath, html);

// ----- console summary ------------------------------------------------------

console.error(`\n=== Weekly summary written to: ${outPath} ===`);
console.error(`Range: ${startDateStr} → ${new Date(endDate.getTime() - 86400000).toISOString().slice(0, 10)} (${days} days)`);
console.error(`Coolers: ${stats.coolers}  ·  Sub-payments: ${stats.payments}  ·  Revenue: $${stats.totalRevenue.toFixed(2)}`);
console.error(`Disco cruises: ${stats.disco}  ·  Group coolers: ${stats.groupCoolers}  ·  Private: ${stats.privateCount}`);
console.error(`Very-large flags: ${stats.veryLarge}`);
console.error(`Boat manifest matched: ${stats.manifestMatched}  ·  Missing on manifest: ${stats.manifestMissing}`);
console.log(outPath);
