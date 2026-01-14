/**
 * Single Order API
 * Note: Local Order model not implemented - orders managed via Shopify
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
    error: 'Orders managed via Shopify Admin API - local Order model not implemented',
    orderId: id,
  }, { status: 501 });
}

export async function PATCH(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Order updates managed via Shopify Admin API - local Order model not implemented',
    orderId: id,
  }, { status: 501 });
}
