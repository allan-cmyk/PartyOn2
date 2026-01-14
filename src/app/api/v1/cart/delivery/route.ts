/**
 * Cart Delivery API
 * Note: Local cart model not implemented - using Shopify cart attributes
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Cart delivery managed via Shopify cart attributes - local cart not implemented',
    data: {
      hasDeliveryInfo: false,
      delivery: null,
    },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Cart delivery managed via Shopify cart attributes - local cart not implemented',
  }, { status: 501 });
}
