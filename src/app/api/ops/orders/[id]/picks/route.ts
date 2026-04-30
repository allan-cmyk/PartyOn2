/**
 * GET  /api/ops/orders/[id]/picks
 * PUT  /api/ops/orders/[id]/picks
 *
 * Persistent pick/pack state for the /ops/orders pick UI. Replaces the prior
 * per-browser localStorage so multiple pickers (different devices/browsers)
 * see the same checkbox + short-by state on a given order.
 *
 * GET: returns { checks: { [itemKey]: { inStock, packed, shortBy } } }
 * PUT: body { itemKey, inStock?, packed?, shortBy? } — upserts a single row.
 *
 * itemKey is item.title for line items, or `${itemTitle}::${bcTitle}` for
 * bundle components, matching the keys the picker UI uses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { requireOpsAuth } from '@/lib/auth/ops-session';

const PutBodySchema = z.object({
  itemKey: z.string().min(1).max(500),
  inStock: z.boolean().optional(),
  packed: z.boolean().optional(),
  shortBy: z.number().int().min(0).max(99999).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  const rows = await prisma.orderItemPickState.findMany({
    where: { orderId },
    select: { itemKey: true, inStock: true, packed: true, shortBy: true },
  });

  const checks: Record<string, { inStock: boolean; packed: boolean; shortBy: number }> = {};
  for (const r of rows) {
    checks[r.itemKey] = { inStock: r.inStock, packed: r.packed, shortBy: r.shortBy };
  }

  return NextResponse.json({ checks });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = PutBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const orderExists = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });
  if (!orderExists) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { itemKey, inStock, packed, shortBy } = parsed.data;

  const row = await prisma.orderItemPickState.upsert({
    where: { orderId_itemKey: { orderId, itemKey } },
    create: {
      orderId,
      itemKey,
      inStock: inStock ?? false,
      packed: packed ?? false,
      shortBy: shortBy ?? 0,
    },
    update: {
      ...(inStock !== undefined ? { inStock } : {}),
      ...(packed !== undefined ? { packed } : {}),
      ...(shortBy !== undefined ? { shortBy } : {}),
    },
    select: { itemKey: true, inStock: true, packed: true, shortBy: true },
  });

  return NextResponse.json({ ok: true, state: row });
}
