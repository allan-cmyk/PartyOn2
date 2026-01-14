/**
 * Single Product API
 * Note: Local Product model not implemented - products managed via Shopify
 * See /api/products for Shopify product API
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
    error: 'Products managed via Shopify Storefront API - local Product model not implemented',
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
    error: 'Product updates managed via Shopify Admin API - local Product model not implemented',
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
    error: 'Product deletion managed via Shopify Admin API - local Product model not implemented',
    productId: id,
  }, { status: 501 });
}
