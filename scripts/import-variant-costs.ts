/**
 * Bulk-import variant costs from a CSV. Generic write-path used by:
 *   - manual cost backfills (Allan fills the export-missing-costs.ts CSV)
 *   - OCR re-process flows
 *   - any future cost automation
 *
 * Usage:
 *   POSTGRES_URL=<prod> npx tsx scripts/import-variant-costs.ts <csv-path> [--dry-run] [--limit=N]
 *
 * Expected CSV columns (header row required):
 *   variant_id, ..., suggested_cost
 * The script reads `variant_id` and `suggested_cost`; other columns are ignored.
 * Rows with empty `suggested_cost` are skipped silently. Costs must parse as positive Decimals.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const csvPath = process.argv[2];
const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

if (!csvPath) {
  console.error('Usage: npx tsx scripts/import-variant-costs.ts <csv-path> [--dry-run] [--limit=N]');
  process.exit(1);
}

interface Row {
  lineNo: number;
  variantId: string;
  suggestedCost: number;
}

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ''));
  const idIdx = header.indexOf('variant_id');
  const costIdx = header.indexOf('suggested_cost');
  if (idIdx === -1) throw new Error('CSV missing required column: variant_id');
  if (costIdx === -1) throw new Error('CSV missing required column: suggested_cost');

  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const variantId = cols[idIdx]?.trim();
    const costStr = cols[costIdx]?.trim();
    if (!variantId || !costStr) continue;
    const cost = Number(costStr);
    if (isNaN(cost) || cost <= 0) {
      console.warn(`  line ${i + 1}: skipping (cost "${costStr}" not a positive number)`);
      continue;
    }
    rows.push({ lineNo: i + 1, variantId, suggestedCost: cost });
  }
  return rows;
}

// Minimal CSV splitter — handles quoted values with embedded commas.
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        result.push(cur);
        cur = '';
      } else cur += ch;
    }
  }
  result.push(cur);
  return result;
}

async function main() {
  const text = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(text).slice(0, LIMIT);
  console.log(`[import-variant-costs] ${rows.length} rows to apply${DRY_RUN ? ' (DRY RUN)' : ''}`);
  if (rows.length === 0) return;

  let updated = 0;
  let skippedNotFound = 0;
  for (const r of rows) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: r.variantId },
      select: { id: true, title: true, costPerUnit: true, product: { select: { title: true } } },
    });
    if (!variant) {
      console.warn(`  line ${r.lineNo}: variant ${r.variantId} not found, skipping`);
      skippedNotFound++;
      continue;
    }
    const current = variant.costPerUnit ? Number(variant.costPerUnit) : null;
    const label = variant.product?.title + (variant.title && variant.title !== 'Default Title' ? ` / ${variant.title}` : '');
    if (current === r.suggestedCost) {
      // No change.
      continue;
    }
    console.log(`  ${label.padEnd(60)} cost: ${current ?? '—'} → $${r.suggestedCost.toFixed(2)}`);
    if (!DRY_RUN) {
      await prisma.productVariant.update({
        where: { id: r.variantId },
        data: { costPerUnit: new Prisma.Decimal(r.suggestedCost) },
      });
    }
    updated++;
  }
  console.log(`[import-variant-costs] ${DRY_RUN ? 'would update' : 'updated'} ${updated} variants${skippedNotFound ? `, skipped ${skippedNotFound} not found` : ''}`);
  if (!DRY_RUN && updated > 0) {
    console.log(`[import-variant-costs] now run: npx tsx scripts/backfill-order-margins.ts to refresh order margins`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
