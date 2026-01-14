/**
 * Inventory API
 * Note: Local inventory model not implemented - inventory managed via Shopify
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const locationId = request.nextUrl.searchParams.get('locationId');

  return NextResponse.json({
    success: false,
    error: 'Inventory managed via Shopify Admin API - local inventory not implemented',
    data: locationId ? [] : [],
    meta: { count: 0 },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Inventory operations managed via Shopify Admin API - local inventory not implemented',
  }, { status: 501 });
}
