/**
 * PATCH /api/v1/inventory/variants/[id]
 * Inline edits from the inventory page.
 *   { quantity: number }     → set absolute inventory quantity (creates audit movement)
 *   { costPerUnit: number }  → set per-selling-unit cost on the variant
 * Either or both fields may be provided.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { adjustInventory } from '@/lib/inventory/services/inventory-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  let body: { quantity?: number | null; costPerUnit?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id },
    select: { id: true, productId: true, inventoryQuantity: true, costPerUnit: true },
  });
  if (!variant) {
    return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
  }

  const updates: { quantity?: number; costPerUnit?: number | null } = {};

  if (body.quantity !== undefined && body.quantity !== null) {
    const target = Math.max(0, Math.floor(Number(body.quantity)));
    const delta = target - variant.inventoryQuantity;
    if (delta !== 0) {
      await adjustInventory({
        productId: variant.productId,
        variantId: variant.id,
        quantity: delta,
        reason: 'Manual edit from inventory page',
        type: 'ADJUSTMENT',
      });
    }
    updates.quantity = target;
  }

  if (body.costPerUnit !== undefined) {
    if (body.costPerUnit === null || Number.isNaN(Number(body.costPerUnit))) {
      await prisma.productVariant.update({
        where: { id },
        data: { costPerUnit: null },
      });
      updates.costPerUnit = null;
    } else {
      const cost = Math.max(0, Number(body.costPerUnit));
      await prisma.productVariant.update({
        where: { id },
        data: { costPerUnit: new Prisma.Decimal(cost) },
      });
      updates.costPerUnit = cost;
    }
  }

  return NextResponse.json({ success: true, updates });
}
