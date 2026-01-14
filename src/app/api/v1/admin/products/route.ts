/**
 * Admin Products API
 * Note: Product model not in Prisma schema - using Shopify for products
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Products managed via Shopify - local model not implemented',
    data: {
      products: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      filters: {
        vendors: [],
        categories: [],
        statuses: [],
      },
    },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Products managed via Shopify - local model not implemented',
  }, { status: 501 });
}
