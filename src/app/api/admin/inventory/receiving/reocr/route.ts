/**
 * Re-OCR every applied receiving invoice with the cost-aware parser, write
 * ReceivingInvoiceLine.unitCost, and (when ?applyToVariants=1) push to
 * ProductVariant.costPerUnit. Idempotent — safe to run multiple times.
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
import { extractPackSizeFromTitle } from '@/lib/inventory/receiving/service';

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
      action: 'updated' | 'no-match' | 'no-cost' | 'no-variant' | 'unchanged';
      invoiceUnitCost: number | null;     // per-bottle from OCR
      packSize: number | null;             // multiplier derived from variant title
      variantCost: number | null;          // invoiceUnitCost × packSize — what we'd write
      variantId: string | null;
      variantLabel: string | null;
      previousVariantCost: number | null;
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
          invoiceUnitCost: null, packSize: null, variantCost: null,
          variantId: dbLine.matchedVariantId, variantLabel: null, previousVariantCost: null,
        });
        continue;
      }

      if (reocrLine.unitCost == null) {
        invSummary.perLine.push({
          lineId: dbLine.id, label, action: 'no-cost',
          invoiceUnitCost: null, packSize: null, variantCost: null,
          variantId: dbLine.matchedVariantId, variantLabel: null, previousVariantCost: null,
        });
        continue;
      }

      const variant = dbLine.matchedVariantId
        ? await prisma.productVariant.findUnique({
            where: { id: dbLine.matchedVariantId },
            select: { id: true, title: true, costPerUnit: true, product: { select: { title: true } } },
          })
        : null;
      const variantLabel = variant
        ? `${variant.product.title}${variant.title && variant.title !== 'Default Title' ? ' / ' + variant.title : ''}`
        : null;
      const previousVariantCost = variant?.costPerUnit ? Number(variant.costPerUnit) : null;
      const packSize = variant
        ? extractPackSizeFromTitle(`${variant.product.title} ${variant.title ?? ''}`)
        : 1;
      const variantCost = Number((reocrLine.unitCost * packSize).toFixed(4));

      // Write to line (raw per-bottle invoice cost).
      if (!dryRun) {
        await prisma.receivingInvoiceLine.update({
          where: { id: dbLine.id },
          data: { unitCost: new Prisma.Decimal(reocrLine.unitCost) },
        });
        totalLineUpdates++;
      }

      // Optionally write to variant (per-selling-unit cost = invoiceUnitCost × packSize).
      const willTouchVariant = applyToVariants && variant != null;
      if (willTouchVariant && !dryRun) {
        await prisma.productVariant.update({
          where: { id: variant!.id },
          data: { costPerUnit: new Prisma.Decimal(variantCost) },
        });
        totalVariantUpdates++;
      }

      invSummary.perLine.push({
        lineId: dbLine.id,
        label,
        action: variant ? 'updated' : 'no-variant',
        invoiceUnitCost: reocrLine.unitCost,
        packSize,
        variantCost,
        variantId: dbLine.matchedVariantId,
        variantLabel,
        previousVariantCost,
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
