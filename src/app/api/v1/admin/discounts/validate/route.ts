/**
 * Discount Code Validation API
 * POST /api/v1/admin/discounts/validate
 * Validates a discount code and returns the discount amount
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateDiscountCode } from '@/lib/discounts/discount-engine';

const ValidateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ValidateSchema.parse(body);

    const result = await validateDiscountCode(validated.code, {
      items: validated.items,
      subtotal: validated.subtotal,
    });

    return NextResponse.json({
      success: true,
      data: {
        valid: result.success,
        discountAmount: result.discountAmount,
        discountType: result.discountType || null,
        discountCode: result.discountCode || null,
        message: result.message || result.error || null,
      },
    });
  } catch (error) {
    console.error('[Discount Validate API] error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
