/**
 * Invoice Items Update API
 * PUT: Allow customer to adjust item quantities before paying
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDraftOrderByToken,
  canDraftOrderBePaid,
  updateDraftOrder,
  calculateDraftOrderAmounts,
} from '@/lib/draft-orders';
import { DraftOrderItem } from '@/lib/draft-orders/types';

interface RouteParams {
  params: Promise<{ token: string }>;
}

interface ItemUpdate {
  productId: string;
  variantId: string;
  quantity: number;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { items } = body as { items: ItemUpdate[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    const draftOrder = await getDraftOrderByToken(token);
    if (!draftOrder) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const { canPay, reason } = canDraftOrderBePaid(draftOrder);
    if (!canPay) {
      return NextResponse.json(
        { success: false, error: reason || 'This invoice cannot be modified' },
        { status: 400 }
      );
    }

    // Build a lookup from existing items to get prices (prevents price tampering)
    const existingItems = draftOrder.items as DraftOrderItem[];
    const itemLookup = new Map<string, DraftOrderItem>();
    for (const item of existingItems) {
      const key = `${item.productId}:${item.variantId}`;
      itemLookup.set(key, item);
    }

    // Build updated items list, using prices from the original invoice
    const updatedItems: DraftOrderItem[] = [];
    for (const update of items) {
      const key = `${update.productId}:${update.variantId}`;
      const original = itemLookup.get(key);

      if (!original) {
        return NextResponse.json(
          { success: false, error: `Item not found on this invoice: ${update.productId}` },
          { status: 400 }
        );
      }

      if (typeof update.quantity !== 'number' || update.quantity < 0 || !Number.isInteger(update.quantity)) {
        return NextResponse.json(
          { success: false, error: 'Quantity must be a non-negative integer' },
          { status: 400 }
        );
      }

      // Skip items with quantity 0 (removal)
      if (update.quantity === 0) continue;

      updatedItems.push({
        ...original,
        quantity: update.quantity,
      });
    }

    // Reject if all items removed
    if (updatedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove all items from the invoice' },
        { status: 400 }
      );
    }

    // Cap baked-in discount at new subtotal
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currentDiscount = Number(draftOrder.discountAmount);
    const cappedDiscount = Math.min(currentDiscount, newSubtotal);

    // Recalculate amounts
    const amounts = calculateDraftOrderAmounts(
      updatedItems,
      draftOrder.deliveryZip,
      Number(draftOrder.deliveryFee),
      cappedDiscount
    );

    // Persist
    const updated = await updateDraftOrder(draftOrder.id, {
      items: updatedItems,
      subtotal: amounts.subtotal,
      taxAmount: amounts.taxAmount,
      discountAmount: cappedDiscount,
    });

    // Return same shape as GET endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const invoiceUrl = `${baseUrl}/invoice/${updated.token}`;

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        invoiceUrl,
        createdBy: undefined,
        adminNotes: undefined,
      },
    });
  } catch (error) {
    console.error('[Invoice Items] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice items' },
      { status: 500 }
    );
  }
}
