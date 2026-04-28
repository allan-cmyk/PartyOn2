/**
 * Re-OCR every applied receiving invoice with the case-cost parser, write
 * ReceivingInvoiceLine.unitCost (semantic = invoice case cost), and
 * (when ?applyToVariants=1) push a selling-unit cost to ProductVariant.costPerUnit.
 * Idempotent — safe to run multiple times.
 *
 * Auth: Bearer CRON_SECRET. One-shot admin op, mirrors the cron auth pattern.
 *
 * Usage:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     'https://partyondelivery.com/api/admin/inventory/receiving/reocr?applyToVariants=1&dryRun=0'
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { parseInvoiceImage, type ParsedInvoiceLine } from '@/lib/inventory/receiving/parser';
import {
  isCasePricedVariant,
  computeCostPerSellingUnit,
} from '@/lib/inventory/receiving/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface DbLineLite {
  distributorSku: string | null;
  distributorDescription: string;
}

function findMatch(reocrLines: ParsedInvoiceLine[], dbLine: DbLineLite): ParsedInvoiceLine | null {
  if (dbLine.distributorSku) {
    const bySku = reocrLines.find(
      (r) => r.distributorSku && r.distributorSku.trim().toUpperCase() === dbLine.distributorSku!.trim().toUpperCase()
    );
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const dryRun = sp.get('dryRun') === '1';
  const applyToVariants = sp.get('applyToVariants') === '1';

  const invoices = await prisma.receivingInvoice.findMany({
    where: { status: 'APPLIED' },
    include: { lines: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });

  const summary: Array<{
    invoiceId: string;
    distributor: string | null;
    parsed: number | null;
    perLine: Array<{
      lineId: string;
      label: string;
      action: 'updated' | 'no-match' | 'no-cost' | 'no-variant' | 'cost-guard-skip';
      caseCost: number | null;          // case cost from OCR
      isCasePriced: boolean | null;      // selling-unit detection
      sellingUnitCost: number | null;    // what we'd write to costPerUnit
      variantId: string | null;
      variantLabel: string | null;
      previousVariantCost: number | null;
      retailDollars: number | null;
      guardNote?: string;
    }>;
    error: string | null;
  }> = [];

  let totalLineUpdates = 0;
  let totalVariantUpdates = 0;

  for (const inv of invoices) {
    const invSummary = {
      invoiceId: inv.id,
      distributor: inv.distributorName,
      parsed: null as number | null,
      perLine: [] as (typeof summary)[number]['perLine'],
      error: null as string | null,
    };

    let parsed;
    try {
      parsed = await parseInvoiceImage(inv.imageUrl);
      invSummary.parsed = parsed.lines.length;
    } catch (err) {
      invSummary.error = err instanceof Error ? err.message : String(err);
      summary.push(invSummary);
      continue;
    }

    for (const dbLine of inv.lines) {
      const reocrLine = findMatch(parsed.lines, dbLine);
      const label =
        (dbLine.distributorSku ? `[${dbLine.distributorSku}] ` : '') + dbLine.distributorDescription.slice(0, 80);

      if (!reocrLine) {
        invSummary.perLine.push({
          lineId: dbLine.id, label, action: 'no-match',
          caseCost: null, isCasePriced: null, sellingUnitCost: null,
          variantId: dbLine.matchedVariantId, variantLabel: null,
          previousVariantCost: null, retailDollars: null,
        });
        continue;
      }

      if (reocrLine.caseCost == null) {
        invSummary.perLine.push({
          lineId: dbLine.id, label, action: 'no-cost',
          caseCost: null, isCasePriced: null, sellingUnitCost: null,
          variantId: dbLine.matchedVariantId, variantLabel: null,
          previousVariantCost: null, retailDollars: null,
        });
        continue;
      }

      const variant = dbLine.matchedVariantId
        ? await prisma.productVariant.findUnique({
            where: { id: dbLine.matchedVariantId },
            select: {
              id: true, title: true, costPerUnit: true, price: true,
              product: { select: { title: true } },
            },
          })
        : null;
      const variantLabel = variant
        ? `${variant.product.title}${variant.title && variant.title !== 'Default Title' ? ' / ' + variant.title : ''}`
        : null;
      const previousVariantCost = variant?.costPerUnit ? Number(variant.costPerUnit) : null;
      const retailDollars = variant?.price != null ? Number(variant.price) : null;
      const combinedTitle = variant ? `${variant.product.title} ${variant.title ?? ''}` : '';
      const isCase = variant ? isCasePricedVariant(combinedTitle) : null;
      const sellingUnitCost = variant
        ? Number(
            computeCostPerSellingUnit({
              combinedTitle,
              caseCost: reocrLine.caseCost,
              unitsPerCase: reocrLine.unitsPerCase,
            }).toFixed(4)
          )
        : null;

      // Always update the line's stored case cost so the source-of-truth on the invoice row matches re-OCR.
      if (!dryRun) {
        await prisma.receivingInvoiceLine.update({
          where: { id: dbLine.id },
          data: { unitCost: new Prisma.Decimal(reocrLine.caseCost) },
        });
        totalLineUpdates++;
      }

      // Plausibility guard for single-bottle variants only.
      const blocked =
        variant != null &&
        isCase === false &&
        retailDollars != null &&
        retailDollars > 0 &&
        sellingUnitCost != null &&
        sellingUnitCost > retailDollars * 3;
      const guardNote = blocked
        ? `proposed selling-unit cost $${sellingUnitCost!.toFixed(2)} > 3× retail $${retailDollars!.toFixed(2)} — likely OCR error on caseCost or unitsPerCase`
        : undefined;

      const willTouchVariant = applyToVariants && variant != null && !blocked && sellingUnitCost != null;
      if (willTouchVariant && !dryRun) {
        await prisma.productVariant.update({
          where: { id: variant!.id },
          data: { costPerUnit: new Prisma.Decimal(sellingUnitCost!) },
        });
        totalVariantUpdates++;
      }

      invSummary.perLine.push({
        lineId: dbLine.id,
        label,
        action: !variant ? 'no-variant' : blocked ? 'cost-guard-skip' : 'updated',
        caseCost: reocrLine.caseCost,
        isCasePriced: isCase,
        sellingUnitCost,
        variantId: dbLine.matchedVariantId,
        variantLabel,
        previousVariantCost,
        retailDollars,
        guardNote,
      });
    }

    summary.push(invSummary);
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    applyToVariants,
    invoiceCount: invoices.length,
    totalLineUpdates,
    totalVariantUpdates,
    invoices: summary,
  });
}
