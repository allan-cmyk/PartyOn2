import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { adjustInventory } from '@/lib/inventory/services/inventory-service';
import type { ParsedInvoice } from './parser';

export interface VariantSuggestion {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string | null;
  score: number;
}

function normalizeKey(sku: string | null, description: string): string {
  const base = sku ? `SKU:${sku.trim().toUpperCase()}` : `DESC:${description.trim().toUpperCase().replace(/\s+/g, ' ')}`;
  return base;
}

/**
 * Compute the per-selling-unit cost (what to write to ProductVariant.costPerUnit)
 * from an invoice line. Always divides — the parser is responsible for setting
 * unitsPerCase to the number of SELLABLE units per case (PPC column when present,
 * else PACK column). For a Coors Light 24-pack sold as the 24-pack, PPC=1 and
 * caseCost/1 = caseCost. For a Cutwater variety pack with 6 four-packs per case,
 * PPC=6 and caseCost/6 = per-four-pack cost.
 */
export function computeCostPerSellingUnit(params: {
  caseCost: number;
  unitsPerCase: number;
}): number {
  const { caseCost, unitsPerCase } = params;
  const denom = unitsPerCase > 0 ? unitsPerCase : 1;
  return caseCost / denom;
}

export async function createInvoiceFromParse(params: {
  imageUrl: string;
  parsed: ParsedInvoice;
  createdBy?: string | null;
}): Promise<string> {
  const { imageUrl, parsed, createdBy } = params;

  const invoiceDate = parsed.invoiceDate ? new Date(parsed.invoiceDate) : null;
  const validDate = invoiceDate && !Number.isNaN(invoiceDate.getTime()) ? invoiceDate : null;

  const invoice = await prisma.receivingInvoice.create({
    data: {
      imageUrl,
      distributorName: parsed.distributorName,
      invoiceNumber: parsed.invoiceNumber,
      invoiceDate: validDate,
      rawParse: parsed as unknown as object,
      createdBy: createdBy ?? null,
      lines: {
        // Legacy DB column `unitCost` now stores the per-line CASE cost from the invoice.
        create: parsed.lines.map((line) => ({
          distributorSku: line.distributorSku,
          distributorDescription: line.description,
          cases: line.cases,
          unitsPerCase: line.unitsPerCase,
          totalUnits: line.cases * line.unitsPerCase,
          unitCost: line.caseCost != null ? new Prisma.Decimal(line.caseCost) : null,
        })),
      },
    },
    include: { lines: true },
  });

  for (const line of invoice.lines) {
    const key = normalizeKey(line.distributorSku, line.distributorDescription);
    const existingMap = await prisma.distributorSkuMap.findUnique({ where: { distributorKey: key } });
    if (existingMap) {
      await prisma.receivingInvoiceLine.update({
        where: { id: line.id },
        data: {
          matchedVariantId: existingMap.variantId,
          unitsPerCase: existingMap.unitsPerCase || line.unitsPerCase,
          totalUnits: line.cases * (existingMap.unitsPerCase || line.unitsPerCase),
          status: 'MATCHED',
        },
      });
    }
  }

  return invoice.id;
}

export async function getVariantSuggestions(description: string, limit = 5): Promise<VariantSuggestion[]> {
  const words = description
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 4);

  if (words.length === 0) return [];

  const variants = await prisma.productVariant.findMany({
    where: {
      OR: words.flatMap((w) => [
        { product: { title: { contains: w, mode: 'insensitive' as const } } },
        { title: { contains: w, mode: 'insensitive' as const } },
      ]),
    },
    include: { product: { select: { id: true, title: true } } },
    take: 50,
  });

  const scored = variants.map((v) => {
    const haystack = `${v.product.title} ${v.title ?? ''}`.toUpperCase();
    const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
    return {
      variantId: v.id,
      productId: v.productId,
      productTitle: v.product.title,
      variantTitle: v.title,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export async function applyInvoice(
  invoiceId: string,
  options: { skipInventory?: boolean } = {}
): Promise<{
  appliedCount: number;
  skipped: number;
  skipInventory: boolean;
  costGuardSkips: Array<{ lineId: string; label: string; reason: string }>;
}> {
  const skipInventory = options.skipInventory === true;
  const invoice = await prisma.receivingInvoice.findUnique({
    where: { id: invoiceId },
    include: { lines: true },
  });

  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status === 'APPLIED') throw new Error('Invoice already applied');

  let appliedCount = 0;
  let skipped = 0;
  const costGuardSkips: Array<{ lineId: string; label: string; reason: string }> = [];
  const reason = `Received from ${invoice.distributorName ?? 'distributor'}${invoice.invoiceNumber ? ` — invoice #${invoice.invoiceNumber}` : ''}`;

  for (const line of invoice.lines) {
    if (!line.matchedVariantId || line.totalUnits <= 0 || line.status === 'SKIPPED') {
      skipped++;
      continue;
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: line.matchedVariantId },
      select: {
        id: true,
        productId: true,
        title: true,
        price: true,
        product: { select: { title: true } },
      },
    });
    if (!variant) {
      skipped++;
      continue;
    }

    if (!skipInventory) {
      await adjustInventory({
        productId: variant.productId,
        variantId: variant.id,
        quantity: line.totalUnits,
        reason,
        type: 'RECEIVED',
      });
    }

    // The DB column `unitCost` holds the case cost from the invoice.
    // Selling-unit cost is always caseCost / unitsPerCase — the parser is responsible
    // for setting unitsPerCase to the number of sellable units per case (PPC column).
    if (line.unitCost != null) {
      const caseCost = Number(line.unitCost);
      const proposed = computeCostPerSellingUnit({
        caseCost,
        unitsPerCase: line.unitsPerCase,
      });

      // Plausibility guard: if the proposed selling-unit cost is more than 3× the
      // variant's retail price, the OCR almost certainly got caseCost or unitsPerCase
      // wrong. Refuse the write rather than corrupt costPerUnit.
      const retailDollars = variant.price != null ? Number(variant.price) : null;
      const blocked =
        retailDollars != null && retailDollars > 0 && proposed > retailDollars * 3;

      if (blocked) {
        const label =
          (line.distributorSku ? `[${line.distributorSku}] ` : '') + line.distributorDescription;
        const note = `proposed cost $${proposed.toFixed(2)} > 3× retail $${retailDollars!.toFixed(2)} — likely OCR error on caseCost or unitsPerCase`;
        console.warn(`[receiving] cost guard skip: ${label} — ${note}`);
        costGuardSkips.push({ lineId: line.id, label, reason: note });
      } else {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { costPerUnit: new Prisma.Decimal(proposed) },
        });
      }
    }

    await prisma.receivingInvoiceLine.update({
      where: { id: line.id },
      data: { status: 'APPLIED' },
    });

    const key = normalizeKey(line.distributorSku, line.distributorDescription);
    await prisma.distributorSkuMap.upsert({
      where: { distributorKey: key },
      update: {
        variantId: line.matchedVariantId,
        unitsPerCase: line.unitsPerCase,
        distributorName: invoice.distributorName,
        timesUsed: { increment: 1 },
        lastUsedAt: new Date(),
      },
      create: {
        distributorKey: key,
        distributorSku: line.distributorSku,
        distributorDescription: line.distributorDescription,
        distributorName: invoice.distributorName,
        variantId: line.matchedVariantId,
        unitsPerCase: line.unitsPerCase,
        timesUsed: 1,
        lastUsedAt: new Date(),
      },
    });

    appliedCount++;
  }

  await prisma.receivingInvoice.update({
    where: { id: invoiceId },
    data: { status: 'APPLIED', appliedAt: new Date() },
  });

  return { appliedCount, skipped, skipInventory, costGuardSkips };
}
