/**
 * Cart Discount API
 * Note: Discount models not in Prisma schema - feature not implemented
 * Discounts are handled via Shopify checkout
 */

import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Cart discounts managed via Shopify checkout - local discount system not implemented',
  }, { status: 501 });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Cart discounts managed via Shopify checkout - local discount system not implemented',
  }, { status: 501 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Automatic discounts managed via Shopify - local discount system not implemented',
    data: {
      automaticDiscounts: [],
      totalAutomaticDiscount: 0,
    },
  }, { status: 501 });
}
