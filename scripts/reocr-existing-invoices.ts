/**
 * Re-OCR existing receiving invoices with the cost-aware parser to populate
 * ReceivingInvoiceLine.unit_cost and (on confirm) ProductVariant.cost_per_unit.
 *
 * Each line's distributorSku/description must match the original — we update by
 * line position within the invoice, since description is fuzzy. Lines that no
 * longer match (description differs after re-OCR) are reported but skipped.
 *
 * Usage:
 *   POSTGRES_URL=<prod> OPENROUTER_API_KEY=<key> npx tsx scripts/reocr-existing-invoices.ts [--invoice=<id>] [--dry-run] [--apply-to-variants]
 *
 * Without --apply-to-variants, only ReceivingInvoiceLine.unit_cost is updated.
 * With --apply-to-variants, also writes the cost to ProductVariant.cost_per_unit
 * (only for lines with a matched variant).
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { parseInvoiceImage } from '../src/lib/inventory/receiving/parser';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');
const APPLY_TO_VARIANTS = process.argv.includes('--apply-to-variants');
const invoiceArg = process.argv.find((a) => a.startsWith('--invoice='));
const ONLY_INVOICE = invoiceArg ? invoiceArg.split('=')[1] : null;

async function main() {
  console.log(`[reocr] starting${DRY_RUN ? ' (DRY RUN)' : ''}${APPLY_TO_VARIANTS ? ' (will write to variants)' : ' (lines only)'}`);

  const invoices = await prisma.receivingInvoice.findMany({
    where: ONLY_INVOICE ? { id: ONLY_INVOICE } : {},
    include: { lines: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`[reocr] ${invoices.length} invoice(s) to process`);

  for (const inv of invoices) {
    console.log('\n=== Invoice ' + inv.id + ' (' + (inv.distributorName ?? 'unknown') + ', ' + inv.lines.length + ' lines) ===');
    console.log('  imageUrl: ' + inv.imageUrl);
    let parsed;
    try {
      parsed = await parseInvoiceImage(inv.imageUrl);
    } catch (err) {
      console.error('  re-OCR failed: ' + (err instanceof Error ? err.message : err));
      continue;
    }
    console.log('  re-OCR returned ' + parsed.lines.length + ' lines');

    // Match re-OCR lines to existing DB lines by SKU first, then by description.
    for (const dbLine of inv.lines) {
      const reocrLine = findMatch(parsed.lines, dbLine);
      const label = (dbLine.distributorSku ? `[${dbLine.distributorSku}] ` : '') + dbLine.distributorDescription.slice(0, 60);
      if (!reocrLine) {
        console.log('  - SKIP   ' + label + ' (no match in re-OCR)');
        continue;
      }
      if (reocrLine.unitCost == null) {
        console.log('  - NULL   ' + label + ' (re-OCR returned no cost)');
        continue;
      }

      const matchedVariantId = dbLine.matchedVariantId;
      const variant = matchedVariantId
        ? await prisma.productVariant.findUnique({
            where: { id: matchedVariantId },
            select: { id: true, title: true, costPerUnit: true, product: { select: { title: true } } },
          })
        : null;
      const variantLabel = variant
        ? `${variant.product.title}${variant.title && variant.title !== 'Default Title' ? ' / ' + variant.title : ''}`
        : '(unmatched)';

      console.log('  - COST   ' + label);
      console.log(`    unitCost: $${reocrLine.unitCost.toFixed(4)}  →  ${variantLabel}  (current variant cost: ${variant?.costPerUnit ? '$' + Number(variant.costPerUnit).toFixed(2) : 'null'})`);

      if (DRY_RUN) continue;

      // Update the line.
      await prisma.receivingInvoiceLine.update({
        where: { id: dbLine.id },
        data: { unitCost: new Prisma.Decimal(reocrLine.unitCost) },
      });

      // Optionally propagate to the variant.
      if (APPLY_TO_VARIANTS && matchedVariantId) {
        await prisma.productVariant.update({
          where: { id: matchedVariantId },
          data: { costPerUnit: new Prisma.Decimal(reocrLine.unitCost) },
        });
      }
    }
  }

  console.log('\n[reocr] done.');
  if (DRY_RUN) console.log('[reocr] this was a dry run — re-run without --dry-run to apply.');
  if (!APPLY_TO_VARIANTS) console.log('[reocr] line costs updated; pass --apply-to-variants to also write ProductVariant.cost_per_unit.');
}

interface DbLineLite {
  distributorSku: string | null;
  distributorDescription: string;
}

function findMatch<T extends { distributorSku: string | null; description: string }>(
  reocrLines: T[],
  dbLine: DbLineLite
): T | null {
  // Prefer exact SKU match, then exact description, then loose contains.
  if (dbLine.distributorSku) {
    const bySku = reocrLines.find((r) => r.distributorSku && r.distributorSku.trim().toUpperCase() === dbLine.distributorSku!.trim().toUpperCase());
    if (bySku) return bySku;
  }
  const desc = dbLine.distributorDescription.trim().toUpperCase();
  const exact = reocrLines.find((r) => r.description.trim().toUpperCase() === desc);
  if (exact) return exact;
  const partial = reocrLines.find((r) => {
    const r2 = r.description.trim().toUpperCase();
    return desc.includes(r2) || r2.includes(desc);
  });
  return partial ?? null;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
