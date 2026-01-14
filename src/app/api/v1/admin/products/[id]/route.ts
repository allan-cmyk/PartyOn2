/**
 * Admin Single Product API
 * Note: Product model not in Prisma schema - using Shopify for products
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
    error: 'Products managed via Shopify - local model not implemented',
    productId: id,
  }, { status: 501 });
}

export async function PUT(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Products managed via Shopify - local model not implemented',
    productId: id,
  }, { status: 501 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Products managed via Shopify - local model not implemented',
    productId: id,
  }, { status: 501 });
}
