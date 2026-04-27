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

export async function applyInvoice(invoiceId: string): Promise<{ appliedCount: number; skipped: number }> {
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
      select: { id: true, productId: true },
    });
    if (!variant) {
      skipped++;
      continue;
    }

    await adjustInventory({
      productId: variant.productId,
      variantId: variant.id,
      quantity: line.totalUnits,
      reason,
      type: 'RECEIVED',
    });

    // Propagate unit cost to ProductVariant.costPerUnit so margin calculations have real data.
    // The latest applied invoice's cost wins (overwrites any prior value).
    if (line.unitCost != null) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { costPerUnit: line.unitCost },
      });
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

  return { appliedCount, skipped };
}
