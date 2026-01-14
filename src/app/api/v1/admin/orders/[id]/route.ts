/**
 * Admin Single Order API
 * Note: Order model not in Prisma schema - using Shopify for orders
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
    error: 'Orders managed via Shopify - local model not implemented',
    orderId: id,
  }, { status: 501 });
}

export async function PUT(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Orders managed via Shopify - local model not implemented',
    orderId: id,
  }, { status: 501 });
}
