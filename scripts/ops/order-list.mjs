#!/usr/bin/env node
/**
 * Generate an aggregated order/pick list from paid orders for a date range.
 * Groups items by category (Beer, Seltzers, Wine, Spirits, Mixers, etc.)
 * and shows vendor/distributor for each product.
 *
 * Usage:
 *   node scripts/ops/order-list.mjs <start-date> <end-date>
 *   node scripts/ops/order-list.mjs 2026-04-10 2026-04-11
 *   node scripts/ops/order-list.mjs 2026-04-10              (single day)
 *
 * Add --html flag to generate a printable HTML sheet:
 *   node scripts/ops/order-list.mjs 2026-04-10 2026-04-11 --html
 *
 * Add --by-group flag to render items grouped by Group Dashboard instead of category:
 *   node scripts/ops/order-list.mjs 2026-04-10 2026-04-11 --by-group
 */
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient();

const FLAGS = new Set(['--html', '--by-group']);
const args = process.argv.slice(2).filter(a => !FLAGS.has(a));
const wantHtml = process.argv.includes('--html');
const byGroup = process.argv.includes('--by-group');

if (args.length === 0) {
  console.error('Usage: node scripts/ops/order-list.mjs <start-date> [end-date] [--html] [--by-group]');
  process.exit(1);
}

const startDate = new Date(args[0] + 'T00:00:00Z');
const endDate = new Date((args[1] || args[0]) + 'T23:59:59Z');

// Category mapping from productType
const CATEGORY_MAP = {
  'Light Beer': 'Beer',
  'Craft Beer': 'Beer',
  'Keg': 'Beer',
  'Seltzer': 'Seltzers & RTDs',
  'RTD Cocktail': 'Seltzers & RTDs',
  'Red Wine': 'Wine',
  'White Wine': 'Wine',
  'Sparkling Wine': 'Wine',
  'Wine': 'Wine',
  'Vodka': 'Spirits',
  'Tequila': 'Spirits',
  'Whiskey': 'Spirits',
  'Gin': 'Spirits',
  'Rum': 'Spirits',
  'Liqueur': 'Spirits',
  'Cocktail Kit': 'Cocktail Kits',
  'Batched Cocktail': 'Cocktail Kits',
  'Mixer': 'Mixers & Non-Alcoholic',
  'Food': 'Mixers & Non-Alcoholic',
  'Weekend Supply': 'Supplies',
  'Chill Supply': 'Supplies',
  'Rental': 'Rentals',
  'Custom': 'Other',
};

const CATEGORY_ORDER = [
  'Beer',
  'Seltzers & RTDs',
  'Wine',
  'Spirits',
  'Cocktail Kits',
  'Mixers & Non-Alcoholic',
  'Supplies',
  'Rentals',
  'Other',
];

// Pull paid orders in date range
const orders = await prisma.order.findMany({
  where: {
    deliveryDate: { gte: startDate, lte: endDate },
    status: { not: 'CANCELLED' },
    financialStatus: 'PAID',
  },
  include: {
    items: {
      include: {
        product: { select: { title: true, productType: true, vendor: true } },
      },
    },
    groupOrderV2: { select: { id: true, name: true, hostName: true } },
  },
  orderBy: { deliveryDate: 'asc' },
});

if (orders.length === 0) {
  console.log('No paid orders found for that date range.');
  await prisma.$disconnect();
  process.exit(0);
}

// Build last-name lookup from orders
function getLastName(customerName) {
  if (!customerName) return '?';
  const parts = customerName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function buildGroupLabel(order) {
  if (!order.groupOrderV2) return null;
  const firstName = (order.groupOrderV2.hostName || '').trim().split(/\s+/)[0] || '?';
  return `${order.groupOrderV2.name} (${firstName})`;
}

// Aggregate items by product
const aggregated = new Map();

for (const order of orders) {
  const lastName = getLastName(order.customerName);
  const groupLabel = buildGroupLabel(order);
  for (const item of order.items) {
    // Aggregate by the REAL product identity, not the historical title snapshot.
    // Old OrderItems may have outdated title strings even though they reference
    // the same product; using the current Product.title gives one clean row per product.
    const key = item.productId
      ? `${item.productId}::${item.variantId || ''}`
      : `legacy::${item.title}`;
    if (!aggregated.has(key)) {
      const productType = item.product?.productType || 'Other';
      const category = CATEGORY_MAP[productType] || 'Other';
      aggregated.set(key, {
        title: item.product?.title || item.title,
        variantTitle: item.variantTitle || '',
        quantity: 0,
        productType,
        vendor: item.product?.vendor || 'Unknown',
        category,
        orders: [], // [{ lastName, qty, groupLabel }]
      });
    }
    const entry = aggregated.get(key);
    entry.quantity += item.quantity;
    entry.orders.push({ lastName, qty: item.quantity, groupLabel });
  }
}

// Group by category
const grouped = {};
for (const cat of CATEGORY_ORDER) grouped[cat] = [];

for (const item of aggregated.values()) {
  if (!grouped[item.category]) grouped[item.category] = [];
  grouped[item.category].push(item);
}

// Sort each group by title
for (const cat of Object.keys(grouped)) {
  grouped[cat].sort((a, b) => a.title.localeCompare(b.title));
}

// Date range label
const dateLabel = args[1] && args[1] !== args[0]
  ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
  : startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

function formatOrderNames(orderEntries) {
  return orderEntries
    .map(o => {
      const base = o.qty > 1 ? `${o.lastName}(${o.qty})` : o.lastName;
      return o.groupLabel ? `${base} [Group: ${o.groupLabel}]` : base;
    })
    .join(', ');
}

// Console output -- --by-group mode groups by Group Dashboard
if (byGroup) {
  // Reshape: bucket every product-line by group label (or "Ungrouped")
  const byGroupMap = new Map();
  for (const item of aggregated.values()) {
    for (const o of item.orders) {
      const label = o.groupLabel || 'Ungrouped';
      if (!byGroupMap.has(label)) byGroupMap.set(label, new Map());
      const productMap = byGroupMap.get(label);
      if (!productMap.has(item.title)) {
        productMap.set(item.title, {
          title: item.title,
          vendor: item.vendor,
          quantity: 0,
          orders: [],
        });
      }
      const prod = productMap.get(item.title);
      prod.quantity += o.qty;
      prod.orders.push({ lastName: o.lastName, qty: o.qty });
    }
  }

  // Sort: groups first alphabetically, "Ungrouped" last
  const groupLabels = Array.from(byGroupMap.keys()).sort((a, b) => {
    if (a === 'Ungrouped') return 1;
    if (b === 'Ungrouped') return -1;
    return a.localeCompare(b);
  });

  console.log(`\nORDER LIST (by group) -- ${dateLabel} (${orders.length} paid orders)\n`);
  for (const label of groupLabels) {
    const productMap = byGroupMap.get(label);
    console.log(`=== ${label} ===`);
    const items = Array.from(productMap.values()).sort((a, b) => a.title.localeCompare(b.title));
    for (const item of items) {
      const vendor = item.vendor !== 'Party On Delivery' ? ` [${item.vendor}]` : '';
      const orderNames = item.orders.map(o => o.qty > 1 ? `${o.lastName}(${o.qty})` : o.lastName).join(', ');
      console.log(`  ${String(item.quantity).padStart(3)}x  ${item.title}${vendor}  --> ${orderNames}`);
    }
    console.log('');
  }
} else {
  // Default console output by category
  console.log(`\nORDER LIST -- ${dateLabel} (${orders.length} paid orders)\n`);

  for (const cat of CATEGORY_ORDER) {
    const items = grouped[cat];
    if (!items || items.length === 0) continue;

    console.log(`=== ${cat.toUpperCase()} ===`);
    for (const item of items) {
      const vendor = item.vendor !== 'Party On Delivery' ? ` [${item.vendor}]` : '';
      const orderNames = formatOrderNames(item.orders);
      console.log(`  ${String(item.quantity).padStart(3)}x  ${item.title}${vendor}  --> ${orderNames}`);
    }
    console.log('');
  }
}

// HTML output
if (wantHtml) {
  const htmlRows = [];

  if (byGroup) {
    // --by-group HTML: section header per group, then product rows
    const byGroupMap = new Map();
    for (const item of aggregated.values()) {
      for (const o of item.orders) {
        const label = o.groupLabel || 'Ungrouped';
        if (!byGroupMap.has(label)) byGroupMap.set(label, new Map());
        const productMap = byGroupMap.get(label);
        if (!productMap.has(item.title)) {
          productMap.set(item.title, {
            title: item.title,
            vendor: item.vendor,
            quantity: 0,
            orders: [],
          });
        }
        const prod = productMap.get(item.title);
        prod.quantity += o.qty;
        prod.orders.push({ lastName: o.lastName, qty: o.qty });
      }
    }
    const groupLabels = Array.from(byGroupMap.keys()).sort((a, b) => {
      if (a === 'Ungrouped') return 1;
      if (b === 'Ungrouped') return -1;
      return a.localeCompare(b);
    });
    for (const label of groupLabels) {
      htmlRows.push(`<tr class="cat"><td colspan="5">${label}</td></tr>`);
      const productMap = byGroupMap.get(label);
      const items = Array.from(productMap.values()).sort((a, b) => a.title.localeCompare(b.title));
      for (const item of items) {
        const vendor = item.vendor !== 'Party On Delivery' ? item.vendor : '';
        const orderNames = item.orders.map(o => o.qty > 1 ? `${o.lastName}(${o.qty})` : o.lastName).join(', ');
        htmlRows.push(`<tr><td class="qty">${item.quantity}</td><td>${item.title}</td><td class="vendor">${vendor}</td><td class="orders">${orderNames}</td><td class="check"></td></tr>`);
      }
    }
  } else {
    // Default HTML: group by category, show group tag inline per line item
    for (const cat of CATEGORY_ORDER) {
      const items = grouped[cat];
      if (!items || items.length === 0) continue;
      htmlRows.push(`<tr class="cat"><td colspan="5">${cat}</td></tr>`);
      for (const item of items) {
        const vendor = item.vendor !== 'Party On Delivery' ? item.vendor : '';
        const orderNames = item.orders
          .map(o => {
            const base = o.qty > 1 ? `${o.lastName}(${o.qty})` : o.lastName;
            return o.groupLabel
              ? `${base} <span class="grouptag">[Group: ${o.groupLabel}]</span>`
              : base;
          })
          .join(', ');
        htmlRows.push(`<tr><td class="qty">${item.quantity}</td><td>${item.title}</td><td class="vendor">${vendor}</td><td class="orders">${orderNames}</td><td class="check"></td></tr>`);
      }
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Order List - ${dateLabel}</title>
<style>
  @page { size: letter; margin: 0.5in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; font-size: 11px; color: #1a1a1a; padding: 0.5in; }
  h1 { font-size: 16px; margin-bottom: 2px; }
  .meta { font-size: 11px; color: #666; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 2px solid #333; padding: 4px 6px; }
  td { padding: 3px 6px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
  tr.cat td { font-weight: 700; font-size: 12px; background: #f0f0f0; padding: 5px 6px; border-bottom: 1px solid #ccc; letter-spacing: 0.3px; }
  .qty { width: 40px; text-align: center; font-weight: 600; font-size: 13px; }
  .vendor { width: 100px; font-size: 10px; color: #888; }
  .orders { font-size: 10px; color: #555; width: 220px; }
  .check { width: 28px; }
  .check::after { content: ''; display: inline-block; width: 14px; height: 14px; border: 1.5px solid #999; border-radius: 2px; vertical-align: middle; }
  .grouptag { display: inline-block; background: #e6fffa; color: #0d9488; padding: 1px 4px; border-radius: 3px; font-size: 9px; margin-left: 2px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>Order List${byGroup ? ' (by group)' : ''}</h1>
<div class="meta">${dateLabel} &mdash; ${orders.length} paid orders</div>
<table>
<thead><tr><th style="width:40px">Qty</th><th>Product</th><th style="width:100px">Vendor</th><th style="width:220px">Orders</th><th style="width:28px"></th></tr></thead>
<tbody>
${htmlRows.join('\n')}
</tbody>
</table>
</body>
</html>`;

  const outPath = resolve('order-list.html');
  writeFileSync(outPath, html);
  console.log(`Printable HTML saved to: ${outPath}`);
  console.log('Open in browser and print (Ctrl+P) for a single-page sheet.');
}

await prisma.$disconnect();
