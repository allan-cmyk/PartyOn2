#!/usr/bin/env node
/**
 * Weekly Purchase Plan
 *
 * Aggregates demand from PAID orders over the next N days, subtracts current
 * available stock, and outputs what to buy — grouped by distributor (vendor).
 *
 * Demand source: PAID orders only.
 * Buy unit: the product variant itself (variants ARE the case — no split cases).
 * Lookahead: 14 calendar days by default.
 *
 * Usage:
 *   node scripts/ops/purchase-plan.mjs                    Terminal, by-vendor, 14 days
 *   node scripts/ops/purchase-plan.mjs --days=21          Custom window
 *   node scripts/ops/purchase-plan.mjs --html             Printable HTML
 *   node scripts/ops/purchase-plan.mjs --html --out=plan.html
 *   node scripts/ops/purchase-plan.mjs --detail=<variantId>  Per-day breakdown for one item
 *   node scripts/ops/purchase-plan.mjs --json             Machine-readable
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

// ── Args ──────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (k, def = null) => {
  const f = argv.find((a) => a.startsWith(`--${k}=`));
  if (f) return f.split('=', 2)[1];
  if (argv.includes(`--${k}`)) return true;
  return def;
};
const days = parseInt(arg('days', '14'), 10);
const wantHtml = !!arg('html');
const wantJson = !!arg('json');
const detailVariantId = arg('detail');
const outFile = arg('out', 'purchase-plan.html');

// ── Window ──────────────────────────────────────
const now = new Date();
const startDate = new Date(now);
startDate.setUTCHours(0, 0, 0, 0);
const endDate = new Date(now);
endDate.setUTCDate(endDate.getUTCDate() + days);
endDate.setUTCHours(23, 59, 59, 999);

// ── Pull paid demand ──────────────────────────
const orderItems = await prisma.orderItem.findMany({
  where: {
    order: {
      deliveryDate: { gte: startDate, lte: endDate },
      financialStatus: 'PAID',
      status: { not: 'CANCELLED' },
    },
  },
  select: {
    quantity: true,
    title: true,
    variantTitle: true,
    productId: true,
    variantId: true,
    order: { select: { orderNumber: true, deliveryDate: true, customerName: true } },
    product: { select: { id: true, title: true, vendor: true, productType: true } },
    variant: {
      select: {
        id: true, title: true, price: true, sku: true,
        inventoryQuantity: true, committedQuantity: true, trackInventory: true,
      },
    },
  },
});

// ── Pull cost + distributor map (raw SQL, sparse data) ──
const variantIds = [...new Set(orderItems.map((i) => i.variantId).filter(Boolean))];
const costMap = new Map();
const distMap = new Map();
if (variantIds.length > 0) {
  const costs = await prisma.$queryRawUnsafe(
    `SELECT id, cost_per_unit FROM product_variants WHERE id = ANY($1::text[])`,
    variantIds,
  );
  for (const r of costs) {
    if (r.cost_per_unit != null) costMap.set(r.id, Number(r.cost_per_unit));
  }
  const dists = await prisma.$queryRawUnsafe(
    `SELECT variant_id, distributor_name, distributor_sku, units_per_case
     FROM distributor_sku_map
     WHERE variant_id = ANY($1::text[])`,
    variantIds,
  );
  for (const r of dists) {
    distMap.set(r.variant_id, {
      distributorName: r.distributor_name,
      distributorSku: r.distributor_sku,
      unitsPerCase: r.units_per_case,
    });
  }
}

// ── Aggregate by variant ──────────────────────
const byVariant = new Map();
for (const item of orderItems) {
  const key = item.variantId || `legacy::${item.title}`;
  if (!byVariant.has(key)) {
    byVariant.set(key, {
      variantId: item.variantId,
      productId: item.productId,
      title: item.product?.title || item.title,
      variantTitle: item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : '',
      vendor: item.product?.vendor || 'Unknown',
      productType: item.product?.productType || 'Other',
      trackInventory: item.variant?.trackInventory ?? true,
      sku: item.variant?.sku || '',
      price: Number(item.variant?.price ?? 0),
      inStock: Number(item.variant?.inventoryQuantity ?? 0),
      committed: Number(item.variant?.committedQuantity ?? 0),
      demand: 0,
      occurrences: [], // [{ orderNumber, customerName, date, qty }]
      cost: costMap.get(item.variantId) ?? null,
      distributor: distMap.get(item.variantId) ?? null,
    });
  }
  const row = byVariant.get(key);
  row.demand += item.quantity;
  row.occurrences.push({
    orderNumber: item.order.orderNumber,
    customerName: item.order.customerName,
    date: item.order.deliveryDate.toISOString().slice(0, 10),
    qty: item.quantity,
  });
}

// ── Compute buy quantity ──────────────────────
const rows = [];
for (const r of byVariant.values()) {
  const available = r.inStock - r.committed;
  const buy = Math.max(0, r.demand - available);
  if (!r.trackInventory) continue; // skip cocktail kits etc.
  const earliest = r.occurrences
    .map((o) => o.date)
    .sort()[0];
  rows.push({
    ...r,
    available,
    buy,
    estCost: r.cost != null ? r.cost * buy : null,
    earliestDate: earliest,
  });
}

// ── Detail mode ──────────────────────────────
if (detailVariantId) {
  const r = rows.find((x) => x.variantId === detailVariantId);
  if (!r) {
    console.error(`No paid demand found for variant ${detailVariantId} in next ${days} days.`);
    process.exit(1);
  }
  console.log(`\n${r.title}${r.variantTitle ? ' · ' + r.variantTitle : ''}`);
  console.log(`Vendor: ${r.vendor}${r.distributor ? ` · ${r.distributor.distributorName} (SKU ${r.distributor.distributorSku})` : ''}`);
  console.log(`In stock: ${r.inStock}  ·  Committed: ${r.committed}  ·  Available: ${r.available}`);
  console.log(`Demand: ${r.demand}  ·  BUY: ${r.buy}${r.cost != null ? `  ·  ${r.estCost.toFixed(2)} est.` : ''}\n`);
  console.log('Demand by date:');
  const byDate = {};
  for (const o of r.occurrences) {
    (byDate[o.date] ||= []).push(o);
  }
  for (const date of Object.keys(byDate).sort()) {
    const items = byDate[date];
    const total = items.reduce((s, x) => s + x.qty, 0);
    console.log(`  ${date} (${total}):`);
    for (const o of items) console.log(`     #${o.orderNumber} ${o.customerName} — ${o.qty}`);
  }
  await prisma.$disconnect();
  process.exit(0);
}

// ── Filter to items needing purchase ─────────
const needBuy = rows.filter((r) => r.buy > 0).sort((a, b) => {
  if (a.vendor !== b.vendor) return a.vendor.localeCompare(b.vendor);
  return a.title.localeCompare(b.title);
});

// ── Group by vendor ──────────────────────────
const byVendor = {};
for (const r of needBuy) {
  (byVendor[r.vendor] ||= []).push(r);
}
const vendorTotals = Object.entries(byVendor).map(([vendor, items]) => {
  const totalBuy = items.reduce((s, r) => s + r.buy, 0);
  const totalCost = items.reduce((s, r) => s + (r.estCost ?? 0), 0);
  const hasAllCosts = items.every((r) => r.cost != null);
  return { vendor, items, totalBuy, totalCost, hasAllCosts };
}).sort((a, b) => b.totalBuy - a.totalBuy);

// ── Compute urgency (demand within 48 hours) ─
const urgentCutoff = new Date(now);
urgentCutoff.setUTCDate(urgentCutoff.getUTCDate() + 2);
const urgent = needBuy.filter((r) => new Date(r.earliestDate) <= urgentCutoff && r.buy > 0);

// ── JSON output ───────────────────────────────
if (wantJson) {
  const out = {
    generatedAt: now.toISOString(),
    windowStart: startDate.toISOString().slice(0, 10),
    windowEnd: endDate.toISOString().slice(0, 10),
    days,
    vendors: vendorTotals,
    urgent,
    summary: {
      vendors: vendorTotals.length,
      skus: needBuy.length,
      totalUnits: needBuy.reduce((s, r) => s + r.buy, 0),
      totalCost: needBuy.reduce((s, r) => s + (r.estCost ?? 0), 0),
    },
  };
  console.log(JSON.stringify(out, null, 2));
  await prisma.$disconnect();
  process.exit(0);
}

// ── Pretty terminal output ───────────────────
const fmtMoney = (n) => `$${n.toFixed(2)}`;
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function pad(s, n, right = false) {
  s = String(s);
  if (s.length >= n) return s.slice(0, n);
  return right ? s + ' '.repeat(n - s.length) : ' '.repeat(n - s.length) + s;
}

const totalSkus = needBuy.length;
const totalUnits = needBuy.reduce((s, r) => s + r.buy, 0);
const totalCost = needBuy.reduce((s, r) => s + (r.estCost ?? 0), 0);

const HEADER = '═'.repeat(78);
console.log('\n' + HEADER);
console.log(`  WEEKLY PURCHASE PLAN — ${fmtDate(startDate.toISOString().slice(0,10))} → ${fmtDate(endDate.toISOString().slice(0,10))} (${days} days)`);
console.log(`  Generated ${now.toISOString().slice(0, 16).replace('T', ' ')}  ·  Source: PAID orders only`);
console.log(HEADER);

if (needBuy.length === 0) {
  console.log('\n  ✓ All paid demand is covered by current available stock.\n');
  await prisma.$disconnect();
  process.exit(0);
}

if (urgent.length > 0) {
  console.log(`\n⚠  URGENT (demand within 48h): ${urgent.length} SKU${urgent.length > 1 ? 's' : ''}`);
  for (const r of urgent) {
    console.log(`   • ${r.title}${r.variantTitle ? ' · ' + r.variantTitle : ''} — need ${r.buy} by ${fmtDate(r.earliestDate)}`);
  }
}

for (const v of vendorTotals) {
  const costBit = v.hasAllCosts && v.totalCost > 0 ? `  ·  ${fmtMoney(v.totalCost)} est.` : '';
  console.log(`\n▸ ${v.vendor} — ${v.items.length} SKUs · ${v.totalBuy} units${costBit}`);
  console.log('  ' + '─'.repeat(76));
  console.log('  ' + pad('Product', 42, true) + pad('Avail', 7) + pad('Need', 7) + pad('Buy', 6) + pad('First', 8) + pad('Cost', 8));
  for (const r of v.items) {
    const titleFull = r.title + (r.variantTitle ? ' · ' + r.variantTitle : '');
    const titleShort = titleFull.length > 40 ? titleFull.slice(0, 39) + '…' : titleFull;
    const costStr = r.cost != null ? fmtMoney(r.estCost) : '—';
    console.log('  ' + pad(titleShort, 42, true) + pad(r.available, 7) + pad(r.demand, 7) + pad(r.buy, 6) + pad(fmtDate(r.earliestDate), 8) + pad(costStr, 8));
  }
}

console.log('\n' + HEADER);
const totalCostStr = totalCost > 0 ? `  ·  ${fmtMoney(totalCost)} est. (partial — ${rows.filter(r => r.buy > 0 && r.cost != null).length}/${needBuy.length} have cost)` : '';
console.log(`  TOTAL: ${vendorTotals.length} distributors · ${totalSkus} SKUs · ${totalUnits} units${totalCostStr}`);
console.log(HEADER + '\n');

// ── HTML output ──────────────────────────────
if (wantHtml) {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);

  const vendorSections = vendorTotals.map((v) => {
    const rowsHtml = v.items.map((r) => `
      <tr>
        <td>${esc(r.title)}${r.variantTitle ? `<br><span class="vt">${esc(r.variantTitle)}</span>` : ''}${r.distributor ? `<br><span class="dsku">${esc(r.distributor.distributorName)} SKU ${esc(r.distributor.distributorSku)}</span>` : ''}</td>
        <td class="num">${r.available}</td>
        <td class="num">${r.demand}</td>
        <td class="num buy">${r.buy}</td>
        <td class="date">${esc(fmtDate(r.earliestDate))}</td>
        <td class="num cost">${r.cost != null ? fmtMoney(r.estCost) : '<span class="dim">—</span>'}</td>
        <td class="check"><input type="checkbox"></td>
      </tr>
    `).join('');
    const costBit = v.hasAllCosts && v.totalCost > 0 ? ` · ${fmtMoney(v.totalCost)} est.` : '';
    return `
      <section class="vendor">
        <h2>${esc(v.vendor)} <span class="vmeta">${v.items.length} SKUs · ${v.totalBuy} units${costBit}</span></h2>
        <table>
          <thead><tr><th>Product</th><th>Avail</th><th>Need</th><th>Buy</th><th>First</th><th>Est. Cost</th><th>✓</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>`;
  }).join('');

  const urgentHtml = urgent.length === 0 ? '' : `
    <section class="urgent">
      <h2>⚠ Urgent — demand within 48 hours</h2>
      <ul>${urgent.map((r) => `<li><strong>${esc(r.title)}</strong>${r.variantTitle ? ' · ' + esc(r.variantTitle) : ''} — need <strong>${r.buy}</strong> by ${esc(fmtDate(r.earliestDate))} (${esc(r.vendor)})</li>`).join('')}</ul>
    </section>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Purchase Plan ${startDate.toISOString().slice(0,10)} → ${endDate.toISOString().slice(0,10)}</title>
<style>
  * { box-sizing: border-box; }
  body { font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; margin: 18px; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: 0.02em; }
  .meta { color: #555; font-size: 13px; margin-bottom: 14px; }
  .summary { display: flex; gap: 16px; margin-bottom: 18px; padding: 10px 14px; background: #f3f7fb; border-left: 3px solid #0B74B8; border-radius: 4px; font-size: 13px; }
  .summary div { color: #333; }
  .summary div strong { color: #0B74B8; font-size: 15px; }
  section.vendor { margin-bottom: 22px; page-break-inside: auto; }
  section.vendor h2 { font-size: 15px; margin: 0 0 5px; padding-bottom: 3px; border-bottom: 2px solid #0B74B8; color: #0B74B8; letter-spacing: 0.02em; }
  section.vendor h2 .vmeta { color: #555; font-weight: normal; font-size: 12px; }
  section.urgent { background: #fff8e1; border: 1px solid #d4af37; border-radius: 4px; padding: 10px 14px; margin-bottom: 18px; }
  section.urgent h2 { color: #b8730e; font-size: 14px; margin: 0 0 6px; }
  section.urgent ul { margin: 0; padding-left: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 5px 7px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { background: #f7f7f7; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; width: 60px; }
  td.buy { font-weight: 700; color: #0B74B8; }
  td.cost { width: 80px; }
  td.date { width: 70px; color: #555; }
  td.check { width: 30px; text-align: center; }
  td.check input { width: 14px; height: 14px; }
  .vt { color: #666; font-size: 11px; }
  .dsku { color: #888; font-size: 10px; font-family: ui-monospace, Menlo, monospace; }
  .dim { color: #aaa; }
  tr { page-break-inside: avoid; }
  @media print { body { margin: 10mm; } h2 { break-after: avoid; } }
</style></head><body>
<h1>Party On Delivery — Purchase Plan</h1>
<div class="meta">${fmtDate(startDate.toISOString().slice(0,10))} – ${fmtDate(endDate.toISOString().slice(0,10))} (${days} days) · Source: PAID orders only · Generated ${now.toISOString().slice(0, 16).replace('T', ' ')}</div>
<div class="summary">
  <div><strong>${vendorTotals.length}</strong> distributors</div>
  <div><strong>${totalSkus}</strong> SKUs</div>
  <div><strong>${totalUnits}</strong> units to buy</div>
  ${totalCost > 0 ? `<div><strong>${fmtMoney(totalCost)}</strong> est. cost (partial)</div>` : ''}
</div>
${urgentHtml}
${vendorSections}
</body></html>`;

  writeFileSync(outFile, html);
  console.log(`HTML saved to: ${outFile}`);
}

await prisma.$disconnect();
