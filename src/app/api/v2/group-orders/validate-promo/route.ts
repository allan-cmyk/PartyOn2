/**
 * POST /api/v2/group-orders/validate-promo
 * Unified endpoint: checks both Discount table and Affiliate table.
 * Returns normalized promo info for the dashboard UI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();
    const orderSubtotal = Number(subtotal) || 0;

    // 1. Try Discount table first
    const discount = await prisma.discount.findUnique({
      where: { code: upperCode, isActive: true },
    });

    if (discount) {
      // Check expiry
      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'This code has expired' },
          { status: 400 }
        );
      }

      // Check max usage
      if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
        return NextResponse.json(
          { success: false, error: 'This code has reached its usage limit' },
          { status: 400 }
        );
      }

      // Check minimum order amount
      if (discount.minOrderAmount && orderSubtotal < Number(discount.minOrderAmount)) {
        return NextResponse.json(
          {
            success: false,
            error: `Minimum order of $${Number(discount.minOrderAmount).toFixed(2)} required`,
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
      }

      const freeDelivery = discount.freeShipping || discount.type === 'FREE_SHIPPING';

      let label = discount.name;
      if (discountAmount > 0) {
        label = `${discount.name} (-$${discountAmount.toFixed(2)})`;
      }
      if (freeDelivery) {
        label = discountAmount > 0
          ? `${discount.name} (-$${discountAmount.toFixed(2)} + Free Delivery)`
          : `${discount.name} (Free Delivery)`;
      }

      return NextResponse.json({
        success: true,
        data: {
          type: 'discount',
          code: discount.code,
          label,
          discountAmount,
          freeDelivery,
        },
      });
    }

    // 2. Try Affiliate table
    const affiliate = await prisma.affiliate.findFirst({
      where: { code: upperCode, status: 'ACTIVE' },
    });

    if (affiliate) {
      return NextResponse.json({
        success: true,
        data: {
          type: 'affiliate',
          code: affiliate.code,
          label: `Free Delivery (via ${affiliate.businessName})`,
          discountAmount: 0,
          freeDelivery: true,
          affiliateId: affiliate.id,
        },
      });
    }

    // 3. Neither found
    return NextResponse.json(
      { success: false, error: 'Invalid promo code' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[Validate Promo] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
