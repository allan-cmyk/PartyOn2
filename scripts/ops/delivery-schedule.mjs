#!/usr/bin/env node
/**
 * Printable HTML delivery schedule for a date range.
 * Shows every paid order's delivery details: customer, date/time, address,
 * cruise type (private/disco — cross-referenced from BoatSchedule),
 * group order if any, items, special notes.
 *
 * Usage:
 *   node scripts/ops/delivery-schedule.mjs <start-date> <end-date> [output.html]
 *   node scripts/ops/delivery-schedule.mjs 2026-04-23 2026-04-30 delivery-schedule.html
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { writeFileSync } from 'fs';
import { resolveGroupLabel } from './_group-label.mjs';

const prisma = new PrismaClient();

const [start, end, out = 'delivery-schedule.html'] = process.argv.slice(2);
if (!start || !end) {
  console.error('Usage: delivery-schedule.mjs <YYYY-MM-DD> <YYYY-MM-DD> [output.html]');
  process.exit(1);
}

const startDate = new Date(start + 'T00:00:00Z');
const endDate = new Date(end + 'T23:59:59Z');

const orders = await prisma.order.findMany({
  where: {
    deliveryDate: { gte: startDate, lte: endDate },
    status: { not: 'CANCELLED' },
    financialStatus: 'PAID',
  },
  select: {
    id: true, orderNumber: true,
    customerName: true, customerEmail: true, customerPhone: true,
    deliveryDate: true, deliveryTime: true, deliveryAddress: true,
    deliveryPhone: true, deliveryInstructions: true, customerNote: true,
    deliveryType: true, total: true,
    groupOrderV2Id: true,
    groupOrderV2: { select: { shareCode: true, name: true, hostName: true, hostPhone: true, hostEmail: true, partyType: true } },
    items: { select: { title: true, variantTitle: true, quantity: true }, orderBy: { title: 'asc' } },
  },
  orderBy: [{ deliveryDate: 'asc' }, { deliveryTime: 'asc' }, { customerName: 'asc' }],
});

// Cross-reference each order against BoatSchedule to detect private/disco.
// IMPORTANT: when an order is part of a group dashboard, we look up the
// manifest using the GROUP's host/cruise-owner name (resolved from the
// dashboard title), not the payer's name. E.g. Maria Mercado paid via
// Cynthia Cruz's dashboard — the manifest entry is "Cynthia Cruz".
async function lookupCruiseType(order, label) {
  // Phone: prefer host phone (cruise-owner) when in a group, fall back to payer
  const groupPhone = order.groupOrderV2?.hostPhone || '';
  const payerPhone = order.customerPhone || '';
  const phones = [groupPhone, payerPhone]
    .map((p) => p.replace(/\D/g, '').slice(-10))
    .filter(Boolean);

  // Names to try: manifest name first, then payer
  const namesToTry = [];
  if (label.manifestName) namesToTry.push(label.manifestName);
  if (label.payerDiffers) namesToTry.push(order.customerName);

  const or = [];
  for (const p of phones) {
    or.push({ normalizedPhone: { contains: p } });
    or.push({ clientPhone: { contains: p } });
  }
  for (const n of namesToTry) {
    const parts = n.trim().split(/\s+/).filter(Boolean);
    const last = parts[parts.length - 1];
    const first = parts[0];
    if (last) or.push({ clientName: { contains: last, mode: 'insensitive' } });
    if (first && first !== last) or.push({ clientName: { contains: first, mode: 'insensitive' } });
  }

  if (or.length === 0) return null;

  const lo = new Date(order.deliveryDate); lo.setUTCDate(lo.getUTCDate() - 1);
  const hi = new Date(order.deliveryDate); hi.setUTCDate(hi.getUTCDate() + 1);

  const bs = await prisma.boatSchedule.findFirst({
    where: { cruiseDate: { gte: lo, lte: hi }, OR: or },
    select: { sheetTab: true, timeSlot: true, boat: true, headcount: true, cruiseDate: true, clientName: true },
  });
  return bs;
}

const enriched = [];
for (const o of orders) {
  const label = resolveGroupLabel(o.groupOrderV2, o.customerName);
  const bs = await lookupCruiseType(o, label);
  let cruiseType = null;
  if (bs) {
    if (bs.sheetTab.includes('PVT')) cruiseType = 'Private';
    else if (bs.sheetTab.includes('DSC')) cruiseType = 'Disco';
  }
  enriched.push({ ...o, bs, cruiseType, label });
}

// Group by group order (if any) within each delivery date
const byDate = {};
for (const o of enriched) {
  const dateKey = o.deliveryDate.toISOString().slice(0, 10);
  (byDate[dateKey] ||= []).push(o);
}

// Count group-order memberships to know which groups have multiple orders
const groupCounts = {};
for (const o of enriched) {
  if (o.groupOrderV2Id) groupCounts[o.groupOrderV2Id] = (groupCounts[o.groupOrderV2Id] || 0) + 1;
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fmtAddr = (addr) => {
  if (!addr || typeof addr !== 'object') return '';
  const parts = [];
  if (addr.address1) parts.push(addr.address1);
  if (addr.address2) parts.push(addr.address2);
  const cz = [addr.city, addr.zip].filter(Boolean).join(' ');
  if (cz) parts.push(cz);
  return parts.join(', ');
};

const fmtDate = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const fmtItems = (items) => {
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  return `<span class="count-pill">${items.length} SKUs · ${totalUnits} units</span>`;
};

const dateSections = Object.keys(byDate).sort().map((d) => {
  // Within a day, group rows by groupOrderV2Id for visual nesting
  const dayOrders = byDate[d];
  const soloOrders = dayOrders.filter((o) => !o.groupOrderV2Id || groupCounts[o.groupOrderV2Id] === 1);
  const groupedByGO = {};
  for (const o of dayOrders) {
    if (o.groupOrderV2Id && groupCounts[o.groupOrderV2Id] > 1) {
      (groupedByGO[o.groupOrderV2Id] ||= []).push(o);
    }
  }

  const renderRow = (o, isGrouped = false) => {
    const addr = fmtAddr(o.deliveryAddress);
    const go = o.groupOrderV2;
    const goTag = go
      ? `<a href="https://partyondelivery.com/dashboard/${esc(go.shareCode)}">${esc(go.shareCode)}</a>${groupCounts[o.groupOrderV2Id] > 1 ? ` <span class="badge">group · ${groupCounts[o.groupOrderV2Id]} orders</span>` : ''}`
      : '';
    const cruise = o.cruiseType
      ? `<span class="cruise ${o.cruiseType.toLowerCase()}">${o.cruiseType}</span>${o.bs?.timeSlot ? ` · ${esc(o.bs.timeSlot)}` : ''}${o.bs?.boat && o.bs.boat !== 'UNASSIGNED' ? ` · ${esc(o.bs.boat)}` : ''}${o.bs?.headcount ? ` · ${o.bs.headcount} pax` : ''}`
      : (o.deliveryType === 'BOAT' ? '<span class="cruise">Boat</span>' : esc(o.deliveryType || ''));
    const notes = [o.deliveryInstructions, o.customerNote].filter(Boolean).join(' · ');

    const payerDiffers = o.label?.payerDiffers;
    const nameCell = payerDiffers
      ? `<strong>${esc(o.label.manifestName)}</strong>
         <div class="under">paid by ${esc(o.customerName)}</div>
         <div class="contact">${o.customerPhone ? esc(o.customerPhone) : ''}${o.customerEmail ? ` · ${esc(o.customerEmail)}` : ''}</div>`
      : `<strong>${esc(o.label?.displayLabel || o.customerName)}</strong>
         <div class="contact">${o.customerPhone ? esc(o.customerPhone) : ''}${o.customerEmail ? ` · ${esc(o.customerEmail)}` : ''}</div>`;

    return `
      <tr class="${isGrouped ? 'in-group' : ''}">
        <td class="time">${esc(o.deliveryTime || '')}</td>
        <td class="name">${nameCell}</td>
        <td class="addr">${esc(addr)}</td>
        <td class="cruise-col">${cruise}</td>
        <td class="group">${goTag}</td>
        <td class="items">${fmtItems(o.items)}${notes ? `<div class="notes"><strong>Note:</strong> ${esc(notes)}</div>` : ''}</td>
        <td class="order">#${o.orderNumber}<br><span class="total">$${Number(o.total).toFixed(0)}</span></td>
      </tr>`;
  };

  const soloRows = soloOrders.map((o) => renderRow(o)).join('');

  const groupBlocks = Object.entries(groupedByGO).map(([gId, ords]) => {
    const go = ords[0].groupOrderV2;
    const header = `
      <tr class="group-header">
        <td colspan="7">
          <span class="gh-label">Group Dashboard:</span>
          <a href="https://partyondelivery.com/dashboard/${esc(go.shareCode)}"><strong>${esc(go.name || go.hostName || go.shareCode)}</strong></a>
          <span class="gh-code">${esc(go.shareCode)}</span>
          <span class="badge">${ords.length} orders</span>
        </td>
      </tr>`;
    return header + ords.map((o) => renderRow(o, true)).join('');
  }).join('');

  return `
    <section class="day">
      <h2>${fmtDate(d)} <span class="count">(${dayOrders.length} ${dayOrders.length === 1 ? 'order' : 'orders'})</span></h2>
      <table>
        <thead>
          <tr>
            <th>Time</th><th>Customer</th><th>Address</th><th>Cruise</th><th>Group</th><th>Items / Notes</th><th>#</th>
          </tr>
        </thead>
        <tbody>
          ${groupBlocks}
          ${soloRows}
        </tbody>
      </table>
    </section>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Delivery Schedule ${start} – ${end}</title>
<style>
  * { box-sizing: border-box; }
  body { font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; margin: 18px; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: 0.02em; }
  .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
  section.day { margin-bottom: 22px; page-break-inside: auto; }
  h2 { font-size: 16px; margin: 0 0 6px; border-bottom: 2px solid #0B74B8; padding-bottom: 3px; color: #0B74B8; }
  h2 .count { color: #666; font-weight: normal; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { text-align: left; padding: 5px 7px; border-bottom: 1px solid #e5e5e5; vertical-align: top; }
  th { background: #f7f7f7; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }
  tr { page-break-inside: avoid; }
  td.time { width: 11%; font-weight: 600; white-space: nowrap; }
  td.name { width: 17%; }
  td.name .contact { color: #666; font-size: 10px; margin-top: 1px; word-break: break-word; }
  td.name .under { color: #b8730e; font-size: 10px; margin-top: 1px; font-style: italic; }
  td.addr { width: 22%; color: #333; }
  td.cruise-col { width: 14%; font-size: 11px; }
  td.group { width: 13%; font-size: 11px; font-family: ui-monospace, Menlo, monospace; }
  td.group a { color: #0B74B8; text-decoration: none; }
  td.items { width: 15%; font-size: 11px; line-height: 1.35; color: #444; }
  td.items .count-pill { display: inline-block; padding: 2px 6px; background: #eef4fa; color: #0B74B8; border-radius: 3px; font-weight: 600; font-size: 11px; white-space: nowrap; }
  td.items .notes { margin-top: 3px; padding: 2px 5px; background: #fff8dc; border-left: 2px solid #d4af37; font-size: 10px; color: #333; }
  td.order { width: 8%; font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: #555; }
  td.order .total { color: #0B74B8; font-weight: 600; }
  .cruise { display: inline-block; padding: 1px 6px; border-radius: 3px; background: #eee; font-weight: 600; font-size: 11px; }
  .cruise.private { background: #0B74B8; color: #fff; }
  .cruise.disco { background: #D4AF37; color: #111; }
  .badge { display: inline-block; margin-left: 4px; padding: 0 5px; border-radius: 3px; background: #ffecb3; font-size: 10px; color: #7a5a00; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  tr.group-header td { background: #eaf4fb; border-top: 2px solid #0B74B8; padding: 6px 8px; font-size: 12px; }
  .gh-label { color: #555; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; margin-right: 6px; }
  .gh-code { color: #666; font-family: ui-monospace, Menlo, monospace; font-size: 11px; margin-left: 8px; }
  tr.in-group td:first-child { border-left: 3px solid #0B74B8; padding-left: 8px; }
  @media print {
    body { margin: 10mm; }
    a { color: #0B74B8; text-decoration: none; }
    h2 { break-after: avoid; }
    section.day { break-inside: auto; }
  }
</style>
</head>
<body>
  <h1>Party On Delivery — Delivery Schedule</h1>
  <div class="meta">${fmtDate(start)} – ${fmtDate(end)} · ${enriched.length} ${enriched.length === 1 ? 'delivery' : 'deliveries'} · ${Object.keys(byDate).length} ${Object.keys(byDate).length === 1 ? 'day' : 'days'}</div>
  ${dateSections}
</body>
</html>`;

writeFileSync(out, html);
console.log(`Wrote ${out} — ${enriched.length} deliveries across ${Object.keys(byDate).length} day(s)`);
await prisma.$disconnect();
