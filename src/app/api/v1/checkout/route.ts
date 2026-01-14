/**
 * Checkout API
 * Note: Local checkout not implemented - using Shopify checkout
 * Checkout flow handled via Shopify Storefront API
 * See /lib/shopify/mutations.ts for checkout functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  return NextResponse.json({
    success: false,
    error: 'Checkout managed via Shopify - local checkout not implemented',
    data: sessionId ? { sessionId } : null,
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Checkout managed via Shopify - local checkout not implemented',
  }, { status: 501 });
}
