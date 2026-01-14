/**
 * Product Search API
 * Note: Local Product model not implemented - products managed via Shopify
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.get('q');

  return NextResponse.json({
    success: false,
    error: 'Product search managed via Shopify Storefront API - local Product model not implemented',
    data: [],
    meta: {
      query: query || '',
      count: 0,
    },
  }, { status: 501 });
}
