/**
 * Products API
 * Note: Local Product model not implemented - products managed via Shopify
 * See /api/products for Shopify product API
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Products managed via Shopify Storefront API - local Product model not implemented. Use /api/products instead.',
    data: [],
    meta: {
      total: 0,
      page: 1,
      pageSize: 20,
      hasMore: false,
    },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Product creation managed via Shopify Admin API - local Product model not implemented',
  }, { status: 501 });
}
