/**
 * POST /api/v2/group-orders/validate-discount
 * Validate a discount code and return discount details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Discount code is required' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Check expiry
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This discount code has expired' },
        { status: 400 }
      );
    }

    // Check max usage
    if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
      return NextResponse.json(
        { success: false, error: 'This discount code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    const orderSubtotal = Number(subtotal) || 0;
    if (discount.minOrderAmount && orderSubtotal < Number(discount.minOrderAmount)) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order of $${Number(discount.minOrderAmount).toFixed(2)} required for this code`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = Math.round(orderSubtotal * (Number(discount.value) / 100) * 100) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(Number(discount.value), orderSubtotal);
    } else if (discount.type === 'FREE_SHIPPING') {
      discountAmount = 0; // Handled separately
    }

    return NextResponse.json({
      success: true,
      data: {
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: Number(discount.value),
        discountAmount,
      },
    });
  } catch (error) {
    console.error('[Validate Discount] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
