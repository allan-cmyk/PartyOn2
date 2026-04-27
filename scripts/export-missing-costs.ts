/**
 * Export a CSV of variants that have null costPerUnit, sorted by recent revenue.
 * Useful for prioritizing which variants need cost data to maximize margin coverage.
 *
 * Usage:
 *   POSTGRES_URL=<prod> npx tsx scripts/export-missing-costs.ts [--days=90] [--limit=100]
 *
 * Output: data/missing-costs-YYYY-MM-DD.csv
 *   variant_id, sku, product_title, variant_title, units_sold_90d, revenue_90d, current_cost
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseFlag(name: string, defaultValue: number): number {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!arg) return defaultValue;
  const val = parseInt(arg.split('=')[1], 10);
  return isNaN(val) ? defaultValue : val;
}

async function main() {
  const days = parseFlag('days', 90);
  const limit = parseFlag('limit', 100);
  const since = new Date();
  since.setDate(since.getDate() - days);

  console.log(`[export-missing-costs] window: last ${days} days, top ${limit} variants by revenue`);

  const rows = (await prisma.$queryRaw`
    SELECT v.id as variant_id,
           v.sku,
           p.title as product_title,
           v.title as variant_title,
           SUM(oi.quantity)::int as units_sold,
           SUM(oi.total_price)::numeric(10,2) as revenue,
           v.cost_per_unit as current_cost
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN product_variants v ON oi.variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE o.created_at >= ${since}
      AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      AND v.cost_per_unit IS NULL
    GROUP BY v.id, v.sku, v.title, v.cost_per_unit, p.title
    ORDER BY SUM(oi.total_price) DESC
    LIMIT ${limit}
  `) as Array<{
    variant_id: string;
    sku: string | null;
    product_title: string;
    variant_title: string;
    units_sold: number;
    revenue: string;
    current_cost: string | null;
  }>;

  console.log(`[export-missing-costs] found ${rows.length} variants with null cost`);

  const escapeCsv = (s: string | number | null): string => {
    if (s == null) return '';
    const str = String(s);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push('variant_id,sku,product_title,variant_title,units_sold,revenue,current_cost,suggested_cost');
  for (const r of rows) {
    lines.push([
      escapeCsv(r.variant_id),
      escapeCsv(r.sku),
      escapeCsv(r.product_title),
      escapeCsv(r.variant_title),
      r.units_sold,
      r.revenue,
      escapeCsv(r.current_cost),
      '', // suggested_cost — fill in
    ].join(','));
  }

  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const today = new Date().toISOString().split('T')[0];
  const outPath = path.join(dataDir, `missing-costs-${today}.csv`);
  fs.writeFileSync(outPath, lines.join('\n'));

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue), 0);
  console.log(`[export-missing-costs] wrote ${outPath}`);
  console.log(`[export-missing-costs] total revenue from these variants (${days}d): $${totalRevenue.toLocaleString()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
