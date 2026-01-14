/**
 * Product Inventory API
 * Note: Local Product/Inventory models not implemented - products managed via Shopify
 */

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Product inventory managed via Shopify Admin API - local inventory model not implemented',
    data: {
      productId: id,
      inventory: [],
      totals: {
        totalQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        locationCount: 0,
      },
    },
  }, { status: 501 });
}
