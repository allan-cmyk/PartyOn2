/**
 * Product Variants API
 * Note: Local Product model not implemented - products managed via Shopify
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
    error: 'Product variants managed via Shopify Storefront API - local Product model not implemented',
    productId: id,
    data: [],
    meta: { count: 0 },
  }, { status: 501 });
}

export async function POST(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Product variants managed via Shopify Admin API - local Product model not implemented',
    productId: id,
  }, { status: 501 });
}
