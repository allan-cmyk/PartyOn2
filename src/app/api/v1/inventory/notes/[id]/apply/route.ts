import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adjustInventory, getDefaultLocation } from '@/lib/inventory/services/inventory-service';

interface ApplyAdjustment {
  productId: string;
  variantId?: string;
  quantity: number;
  action: 'add' | 'remove' | 'set';
}

/**
 * POST /api/v1/inventory/notes/[id]/apply
 * Apply confirmed adjustments from a parsed note.
 * Body: { adjustments: ApplyAdjustment[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adjustments } = body as { adjustments: ApplyAdjustment[] };

    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Adjustments array is required' },
        { status: 400 }
      );
    }

    // Load the note
    const note = await prisma.inventoryNote.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    if (note.status === 'processed') {
      return NextResponse.json(
        { success: false, error: 'Note has already been processed' },
        { status: 400 }
      );
    }

    // Get default location for adjustments
    const defaultLocation = await getDefaultLocation();
    if (!defaultLocation) {
      return NextResponse.json(
        { success: false, error: 'No default inventory location configured' },
        { status: 500 }
      );
    }

    const results = [];

    for (const adj of adjustments) {
      // Convert action to quantity delta
      let quantity: number;
      if (adj.action === 'add') {
        quantity = Math.abs(adj.quantity);
      } else if (adj.action === 'remove') {
        quantity = -Math.abs(adj.quantity);
      } else {
        // 'set' - we need to calculate the delta from current inventory
        const currentItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: adj.productId,
            locationId: defaultLocation.id,
            variantId: adj.variantId || null,
          },
        });
        const currentQty = currentItem?.quantity ?? 0;
        quantity = adj.quantity - currentQty;
      }

      const result = await adjustInventory({
        productId: adj.productId,
        variantId: adj.variantId,
        locationId: defaultLocation.id,
        quantity,
        reason: `Inventory note: ${note.content.substring(0, 100)}`,
        type: 'ADJUSTMENT',
      });

      results.push({
        productId: adj.productId,
        variantId: adj.variantId,
        previousQuantity: result.previousQuantity,
        newQuantity: result.newQuantity,
      });
    }

    // Mark note as processed
    await prisma.inventoryNote.update({
      where: { id },
      data: { status: 'processed' },
    });

    return NextResponse.json({
      success: true,
      data: { noteId: id, results },
    });
  } catch (error) {
    console.error('Failed to apply inventory note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply adjustments' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/inventory/notes/[id]/apply
 * Dismiss a note without applying (mark as dismissed)
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const note = await prisma.inventoryNote.findUnique({ where: { id } });
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    await prisma.inventoryNote.update({
      where: { id },
      data: { status: 'dismissed' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to dismiss inventory note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss note' },
      { status: 500 }
    );
  }
}
