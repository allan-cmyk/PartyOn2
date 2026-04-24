#!/usr/bin/env node
/**
 * Walk through products with missing COGS, ranked by recent revenue,
 * prompt for each variant's cost, and update ProductVariant.costPerUnit.
 *
 * Optionally also backfills historical OrderItem.unitCost / totalCost and
 * recomputes Order.marginAmount for any past orders that included the
 * product, so margin reports reflect the new cost immediately.
 *
 * Usage:
 *   node scripts/ops/enter-cogs.mjs                   # top 20 by 90d revenue
 *   node scripts/ops/enter-cogs.mjs --limit=50        # top 50
 *   node scripts/ops/enter-cogs.mjs --days=180        # window for revenue ranking
 *   node scripts/ops/enter-cogs.mjs --no-backfill     # only update variant, skip historical items
 *
 * Controls at the prompt: a number = cost per unit, <enter> = skip, "q" = quit.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const a = args.find((x) => x.startsWith(`${flag}=`));
  return a ? a.split('=')[1] : fallback;
};
const limit = parseInt(getArg('--limit', '20'), 10);
const days = parseInt(getArg('--days', '90'), 10);
const skipBackfill = args.includes('--no-backfill');

const rl = readline.createInterface({ input, output });

function fmtMoney(n) {
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function main() {
  console.log(`\nFinding top ${limit} products with missing COGS (ranked by last ${days}d revenue)...\n`);

  const products = await prisma.$queryRawUnsafe(`
    SELECT
      p.id AS product_id,
      p.title,
      SUM(oi.quantity)::int AS units_sold,
      SUM(oi.total_price)::numeric AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= NOW() - INTERVAL '${days} days'
      AND o.status NOT IN ('CANCELLED','REFUNDED')
      AND oi.unit_cost IS NULL
    GROUP BY p.id, p.title
    HAVING COUNT(DISTINCT CASE WHEN EXISTS (
      SELECT 1 FROM product_variants pv
      WHERE pv.product_id = p.id AND pv.cost_per_unit IS NULL
    ) THEN p.id END) > 0
    ORDER BY SUM(oi.total_price) DESC
    LIMIT ${limit};
  `);

  if (products.length === 0) {
    console.log('Nothing to do — no products with missing COGS in the window.\n');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let backfilledItems = 0;
  let recomputedOrders = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const variants = await prisma.productVariant.findMany({
      where: { productId: p.product_id, costPerUnit: null },
      select: { id: true, title: true, sku: true, price: true },
    });

    if (variants.length === 0) continue;

    console.log(`\n[${i + 1}/${products.length}]  ${p.title}`);
    console.log(`    ${p.units_sold} units sold, ${fmtMoney(p.revenue)} revenue (${days}d), ${variants.length} variant(s) missing cost`);

    for (const v of variants) {
      const label = v.title && v.title !== 'Default Title' ? `${v.title} — ` : '';
      const sku = v.sku ? `[${v.sku}] ` : '';
      const price = fmtMoney(v.price);
      const answer = (await rl.question(`    ${sku}${label}price ${price} — enter cost per unit (number / <enter> skip / q quit): `)).trim();

      if (answer.toLowerCase() === 'q') {
        console.log('\nQuitting.');
        await summary();
        return;
      }
      if (!answer) {
        skipped++;
        continue;
      }
      const cost = parseFloat(answer);
      if (!Number.isFinite(cost) || cost < 0) {
        console.log('    invalid number, skipping.');
        skipped++;
        continue;
      }
      const margin = Number(v.price) - cost;
      const marginPct = Number(v.price) > 0 ? (margin / Number(v.price)) * 100 : 0;
      console.log(`    → cost ${fmtMoney(cost)}  margin ${fmtMoney(margin)} (${marginPct.toFixed(1)}%)`);

      const confirm = (await rl.question(`    save? (Y/n): `)).trim().toLowerCase();
      if (confirm === 'n') {
        skipped++;
        continue;
      }

      await prisma.productVariant.update({
        where: { id: v.id },
        data: { costPerUnit: new Prisma.Decimal(cost) },
      });
      updated++;

      if (!skipBackfill) {
        const items = await prisma.orderItem.findMany({
          where: { variantId: v.id, unitCost: null },
          select: { id: true, orderId: true, quantity: true },
        });
        const touchedOrders = new Set();
        for (const item of items) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              unitCost: new Prisma.Decimal(cost),
              totalCost: new Prisma.Decimal(cost).mul(item.quantity),
            },
          });
          backfilledItems++;
          touchedOrders.add(item.orderId);
        }
        for (const orderId of touchedOrders) {
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
            select: { totalPrice: true, totalCost: true },
          });
          const withCost = orderItems.filter((x) => x.totalCost !== null);
          if (withCost.length === 0) continue;
          const margin = withCost.reduce(
            (acc, x) => acc.add(new Prisma.Decimal(x.totalPrice)).sub(new Prisma.Decimal(x.totalCost)),
            new Prisma.Decimal(0)
          );
          await prisma.order.update({
            where: { id: orderId },
            data: { marginAmount: margin },
          });
          recomputedOrders++;
        }
        if (items.length > 0) {
          console.log(`    backfilled ${items.length} historical order item(s) across ${touchedOrders.size} order(s)`);
        }
      }
    }
  }

  await summary();

  async function summary() {
    console.log('\n─────────────────');
    console.log(`variants updated:   ${updated}`);
    console.log(`variants skipped:   ${skipped}`);
    if (!skipBackfill) {
      console.log(`order items backfilled: ${backfilledItems}`);
      console.log(`orders recomputed:  ${recomputedOrders}`);
    }
    console.log('─────────────────\n');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
