/**
 * Weekly Purchase Plan cron — runs Monday 13:00 UTC (8am Central).
 *
 * Aggregates demand from PAID orders over the next 14 days, subtracts current
 * available stock, and emails a printable HTML purchase plan grouped by
 * distributor (vendor). Mirrors the manual `node scripts/ops/purchase-plan.mjs`
 * tool used by the operator via `/inventory plan`.
 *
 * Demand source: PAID orders only (status != CANCELLED).
 * Buy unit: the product variant itself (variants ARE the case — no split cases).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { resend } from '@/lib/email/resend-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const DEFAULT_DAYS = 14;

interface PlanRow {
  variantId: string | null;
  productId: string | null;
  title: string;
  variantTitle: string;
  vendor: string;
  productType: string;
  sku: string;
  inStock: number;
  committed: number;
  available: number;
  demand: number;
  buy: number;
  cost: number | null;
  estCost: number | null;
  earliestDate: string;
  distributor: { distributorName: string; distributorSku: string; unitsPerCase: number | null } | null;
}

interface VendorBucket {
  vendor: string;
  items: PlanRow[];
  totalBuy: number;
  totalCost: number;
  hasAllCosts: boolean;
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c),
  );
}

async function buildPlan(days: number) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setUTCDate(endDate.getUTCDate() + days);
  endDate.setUTCHours(23, 59, 59, 999);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        deliveryDate: { gte: startDate, lte: endDate },
        financialStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
    },
    select: {
      quantity: true,
      title: true,
      variantTitle: true,
      productId: true,
      variantId: true,
      order: { select: { orderNumber: true, deliveryDate: true, customerName: true } },
      product: { select: { id: true, title: true, vendor: true, productType: true } },
      variant: {
        select: {
          id: true, title: true, sku: true,
          inventoryQuantity: true, committedQuantity: true, trackInventory: true,
        },
      },
    },
  });

  // Cost + distributor (raw SQL — sparse data)
  const variantIds = [...new Set(orderItems.map((i) => i.variantId).filter((v): v is string => !!v))];
  const costMap = new Map<string, number>();
  const distMap = new Map<string, { distributorName: string; distributorSku: string; unitsPerCase: number | null }>();
  if (variantIds.length > 0) {
    const costs = await prisma.$queryRawUnsafe<Array<{ id: string; cost_per_unit: number | null }>>(
      `SELECT id, cost_per_unit FROM product_variants WHERE id = ANY($1::text[])`,
      variantIds,
    );
    for (const r of costs) {
      if (r.cost_per_unit != null) costMap.set(r.id, Number(r.cost_per_unit));
    }
    const dists = await prisma.$queryRawUnsafe<Array<{ variant_id: string; distributor_name: string; distributor_sku: string; units_per_case: number | null }>>(
      `SELECT variant_id, distributor_name, distributor_sku, units_per_case
       FROM distributor_sku_map
       WHERE variant_id = ANY($1::text[])`,
      variantIds,
    );
    for (const r of dists) {
      distMap.set(r.variant_id, {
        distributorName: r.distributor_name,
        distributorSku: r.distributor_sku,
        unitsPerCase: r.units_per_case,
      });
    }
  }

  // Aggregate by variant
  type AggRow = PlanRow & { occurrences: Array<{ orderNumber: number; customerName: string; date: string; qty: number }>; trackInventory: boolean };
  const byVariant = new Map<string, AggRow>();
  for (const item of orderItems) {
    const key = item.variantId || `legacy::${item.title}`;
    if (!byVariant.has(key)) {
      byVariant.set(key, {
        variantId: item.variantId,
        productId: item.productId,
        title: item.product?.title || item.title,
        variantTitle: item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : '',
        vendor: item.product?.vendor || 'Unknown',
        productType: item.product?.productType || 'Other',
        trackInventory: item.variant?.trackInventory ?? true,
        sku: item.variant?.sku || '',
        inStock: Number(item.variant?.inventoryQuantity ?? 0),
        committed: Number(item.variant?.committedQuantity ?? 0),
        available: 0,
        demand: 0,
        buy: 0,
        cost: item.variantId ? costMap.get(item.variantId) ?? null : null,
        estCost: null,
        earliestDate: '',
        distributor: item.variantId ? distMap.get(item.variantId) ?? null : null,
        occurrences: [],
      });
    }
    const row = byVariant.get(key)!;
    row.demand += item.quantity;
    row.occurrences.push({
      orderNumber: item.order.orderNumber,
      customerName: item.order.customerName,
      date: item.order.deliveryDate.toISOString().slice(0, 10),
      qty: item.quantity,
    });
  }

  // Compute available, buy, cost, earliest
  const rows: PlanRow[] = [];
  for (const r of byVariant.values()) {
    if (!r.trackInventory) continue;
    const available = r.inStock - r.committed;
    const buy = Math.max(0, r.demand - available);
    const earliest = r.occurrences.map((o) => o.date).sort()[0] || '';
    const estCost = r.cost != null ? r.cost * buy : null;
    rows.push({
      variantId: r.variantId, productId: r.productId,
      title: r.title, variantTitle: r.variantTitle, vendor: r.vendor,
      productType: r.productType, sku: r.sku,
      inStock: r.inStock, committed: r.committed, available,
      demand: r.demand, buy,
      cost: r.cost, estCost,
      earliestDate: earliest,
      distributor: r.distributor,
    });
  }

  const needBuy = rows
    .filter((r) => r.buy > 0)
    .sort((a, b) => a.vendor.localeCompare(b.vendor) || a.title.localeCompare(b.title));

  const byVendor: Record<string, PlanRow[]> = {};
  for (const r of needBuy) (byVendor[r.vendor] ||= []).push(r);
  const vendorTotals: VendorBucket[] = Object.entries(byVendor).map(([vendor, items]) => {
    const totalBuy = items.reduce((s, r) => s + r.buy, 0);
    const totalCost = items.reduce((s, r) => s + (r.estCost ?? 0), 0);
    const hasAllCosts = items.every((r) => r.cost != null);
    return { vendor, items, totalBuy, totalCost, hasAllCosts };
  }).sort((a, b) => b.totalBuy - a.totalBuy);

  const urgentCutoff = new Date(now);
  urgentCutoff.setUTCDate(urgentCutoff.getUTCDate() + 2);
  const urgent = needBuy.filter((r) => r.earliestDate && new Date(r.earliestDate) <= urgentCutoff);

  return {
    generatedAt: now,
    windowStart: startDate.toISOString().slice(0, 10),
    windowEnd: endDate.toISOString().slice(0, 10),
    days,
    vendorTotals,
    urgent,
    needBuy,
    summary: {
      vendors: vendorTotals.length,
      skus: needBuy.length,
      totalUnits: needBuy.reduce((s, r) => s + r.buy, 0),
      totalCost: needBuy.reduce((s, r) => s + (r.estCost ?? 0), 0),
    },
  };
}

function renderHtml(plan: Awaited<ReturnType<typeof buildPlan>>): string {
  const { vendorTotals, urgent, summary, windowStart, windowEnd, days, generatedAt } = plan;

  const vendorSections = vendorTotals.map((v) => {
    const rowsHtml = v.items.map((r) => `
      <tr>
        <td>${esc(r.title)}${r.variantTitle ? `<br><span class="vt">${esc(r.variantTitle)}</span>` : ''}${r.distributor ? `<br><span class="dsku">${esc(r.distributor.distributorName)} SKU ${esc(r.distributor.distributorSku)}</span>` : ''}</td>
        <td class="num">${r.available}</td>
        <td class="num">${r.demand}</td>
        <td class="num buy">${r.buy}</td>
        <td class="date">${esc(fmtDate(r.earliestDate))}</td>
        <td class="num cost">${r.cost != null ? fmtMoney(r.estCost!) : '<span class="dim">—</span>'}</td>
      </tr>`).join('');
    const costBit = v.hasAllCosts && v.totalCost > 0 ? ` · ${fmtMoney(v.totalCost)} est.` : '';
    return `
      <section class="vendor">
        <h2>${esc(v.vendor)} <span class="vmeta">${v.items.length} SKUs · ${v.totalBuy} units${costBit}</span></h2>
        <table>
          <thead><tr><th>Product</th><th>Avail</th><th>Need</th><th>Buy</th><th>First</th><th>Est. Cost</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>`;
  }).join('');

  const urgentHtml = urgent.length === 0 ? '' : `
    <section class="urgent">
      <h2>⚠ Urgent — demand within 48 hours</h2>
      <ul>${urgent.map((r) => `<li><strong>${esc(r.title)}</strong>${r.variantTitle ? ' · ' + esc(r.variantTitle) : ''} — need <strong>${r.buy}</strong> by ${esc(fmtDate(r.earliestDate))} (${esc(r.vendor)})</li>`).join('')}</ul>
    </section>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Purchase Plan</title>
<style>
  body { font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; max-width: 760px; margin: 0 auto; padding: 18px; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: 0.02em; }
  .meta { color: #555; font-size: 13px; margin-bottom: 14px; }
  .summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 18px; padding: 10px 14px; background: #f3f7fb; border-left: 3px solid #0B74B8; border-radius: 4px; font-size: 13px; }
  .summary div strong { color: #0B74B8; font-size: 15px; }
  section.vendor { margin-bottom: 22px; }
  section.vendor h2 { font-size: 15px; margin: 0 0 5px; padding-bottom: 3px; border-bottom: 2px solid #0B74B8; color: #0B74B8; letter-spacing: 0.02em; }
  section.vendor h2 .vmeta { color: #555; font-weight: normal; font-size: 12px; }
  section.urgent { background: #fff8e1; border: 1px solid #d4af37; border-radius: 4px; padding: 10px 14px; margin-bottom: 18px; }
  section.urgent h2 { color: #b8730e; font-size: 14px; margin: 0 0 6px; }
  section.urgent ul { margin: 0; padding-left: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 5px 7px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { background: #f7f7f7; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; width: 60px; }
  td.buy { font-weight: 700; color: #0B74B8; }
  td.cost { width: 80px; }
  td.date { width: 70px; color: #555; }
  .vt { color: #666; font-size: 11px; }
  .dsku { color: #888; font-size: 10px; font-family: ui-monospace, Menlo, monospace; }
  .dim { color: #aaa; }
</style></head><body>
<h1>Party On Delivery — Purchase Plan</h1>
<div class="meta">${esc(fmtDate(windowStart))} – ${esc(fmtDate(windowEnd))} (${days} days) · Source: PAID orders only · Generated ${esc(generatedAt.toISOString().slice(0, 16).replace('T', ' '))} UTC</div>
<div class="summary">
  <div><strong>${summary.vendors}</strong> distributors</div>
  <div><strong>${summary.skus}</strong> SKUs</div>
  <div><strong>${summary.totalUnits}</strong> units to buy</div>
  ${summary.totalCost > 0 ? `<div><strong>${fmtMoney(summary.totalCost)}</strong> est. cost (partial)</div>` : ''}
</div>
${urgentHtml}
${vendorSections}
</body></html>`;
}

export async function GET(request: NextRequest) {
  // Auth: allow Vercel cron (always) or manual call with CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');
  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plan = await buildPlan(DEFAULT_DAYS);
    const html = renderHtml(plan);

    const recipient = process.env.PURCHASE_PLAN_TO || process.env.MARKETING_BRIEFING_TO || 'allan@partyondelivery.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@partyondelivery.com';

    const subject = `Purchase Plan · ${plan.summary.skus} SKUs across ${plan.summary.vendors} distributors${plan.urgent.length > 0 ? ` · ${plan.urgent.length} URGENT` : ''}`;

    let emailResult: { sent: boolean; error?: string } = { sent: false };
    if (resend && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: recipient,
          subject,
          html,
        });
        emailResult = { sent: true };
      } catch (err) {
        emailResult = { sent: false, error: err instanceof Error ? err.message : String(err) };
      }
    } else {
      emailResult = { sent: false, error: 'Resend client not configured (RESEND_API_KEY missing)' };
    }

    return NextResponse.json({
      status: 'success',
      window: { start: plan.windowStart, end: plan.windowEnd, days: plan.days },
      summary: plan.summary,
      urgent: plan.urgent.length,
      email: emailResult,
      recipient,
    });
  } catch (err) {
    console.error('[weekly-purchase-plan] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
