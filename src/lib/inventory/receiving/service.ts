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
 * Extract the pack-size multiplier from a variant's product+variant title.
 * Distributor invoices print per-bottle/can cost, but ProductVariant.costPerUnit is
 * per-selling-unit (which for our catalog is usually a multi-pack like "24 Pack").
 * So variant.costPerUnit = invoiceUnitCost * packSize.
 *
 * Examples:
 *   "Lone Star • 24 Pack 12oz Can"           → 24
 *   "Saint Arnold Summer Pils • 6 Pack 12oz" → 6
 *   "Casamigos Tequila Blanco • 750ml Bottle" → 1
 *   "Bottled Water • 32 Pack 16.9oz"          → 32
 */
export function extractPackSizeFromTitle(combinedTitle: string): number {
  const match = combinedTitle.match(/(\d+)\s*Pack/i);
  if (!match) return 1;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
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
        create: parsed.lines.map((line) => ({
          distributorSku: line.distributorSku,
          distributorDescription: line.description,
          cases: line.cases,
          unitsPerCase: line.unitsPerCase,
          totalUnits: line.cases * line.unitsPerCase,
          unitCost: line.unitCost != null ? new Prisma.Decimal(line.unitCost) : null,
        })),
      },
    },
    include: { lines: true },
  });

  // Attempt auto-match from saved mappings
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
): Promise<{ appliedCount: number; skipped: number; skipInventory: boolean }> {
  const skipInventory = options.skipInventory === true;
  const invoice = await prisma.receivingInvoice.findUnique({
    where: { id: invoiceId },
    include: { lines: true },
  });

  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status === 'APPLIED') throw new Error('Invoice already applied');

  let appliedCount = 0;
  let skipped = 0;
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

    // Propagate unit cost to ProductVariant.costPerUnit. Invoice prints per-bottle cost;
    // variant cost is per selling unit (often a multi-pack), so multiply by pack-size.
    // Sanity check: if existing cost is set and the new value differs by >50%, leave it
    // alone — that's typically OCR misreading per-pack as per-bottle (or vice versa)
    // and would corrupt good data.
    if (line.unitCost != null) {
      const fullVariant = await prisma.productVariant.findUnique({
        where: { id: variant.id },
        select: { costPerUnit: true },
      });
      const combinedTitle = `${variant.product.title} ${variant.title ?? ''}`;
      const packSize = extractPackSizeFromTitle(combinedTitle);
      const proposed = Number(line.unitCost) * packSize;
      const existing = fullVariant?.costPerUnit ? Number(fullVariant.costPerUnit) : null;
      const safe =
        existing == null || existing === 0 || Math.abs(proposed - existing) / existing <= 0.5;
      if (safe) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { costPerUnit: new Prisma.Decimal(proposed) },
        });
      } else {
        console.warn(
          `[receiving] cost sanity-check skip: ${combinedTitle} (existing $${existing.toFixed(2)} → proposed $${proposed.toFixed(2)} from invoice line ${line.id})`
        );
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

  return { appliedCount, skipped, skipInventory };
}
