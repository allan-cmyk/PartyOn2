/**
 * Admin Single Discount API
 * Note: Discount model not in Prisma schema - using Shopify for discounts
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
    error: 'Discounts managed via Shopify - local model not implemented',
    discountId: id,
  }, { status: 501 });
}

export async function PUT(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Discounts managed via Shopify - local model not implemented',
    discountId: id,
  }, { status: 501 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Discounts managed via Shopify - local model not implemented',
    discountId: id,
  }, { status: 501 });
}
