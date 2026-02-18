/**
 * Invoice Discount Validation API
 * POST: Validate a discount code against the invoice's cart context
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDraftOrderByToken, canDraftOrderBePaid } from '@/lib/draft-orders';
import { DraftOrderItem } from '@/lib/draft-orders/types';
import { validateDiscountCode } from '@/lib/discounts/discount-engine';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Discount code is required' },
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

    const { canPay } = canDraftOrderBePaid(draftOrder);
    if (!canPay) {
      return NextResponse.json(
        { success: false, error: 'This invoice cannot accept payments' },
        { status: 400 }
      );
    }

    // Build cart context from draft order items
    const items = (draftOrder.items as DraftOrderItem[]).map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
    }));

    const subtotal = Number(draftOrder.subtotal);

    const result = await validateDiscountCode(code, { items, subtotal });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      discountAmount: result.discountAmount,
      discountCode: result.discountCode,
      freeShipping: result.freeShipping || false,
    });
  } catch (error) {
    console.error('[Invoice Discount] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
