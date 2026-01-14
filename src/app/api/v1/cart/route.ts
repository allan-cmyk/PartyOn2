/**
 * Cart API
 * Note: Local cart model not implemented - using Shopify cart
 * Cart operations are handled via Shopify Storefront API
 * See /lib/shopify/hooks/useCart.ts for cart functionality
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Cart managed via Shopify Storefront API - local cart not implemented',
    data: {
      cart: null,
      checkout: null,
      validation: { isValid: false, message: 'Use Shopify cart' },
    },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Cart operations managed via Shopify Storefront API - local cart not implemented',
  }, { status: 501 });
}
