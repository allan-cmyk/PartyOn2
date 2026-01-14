/**
 * Admin Discounts API
 * Note: Discount model not in Prisma schema - using Shopify for discounts
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Discounts managed via Shopify - local model not implemented',
    data: {
      discounts: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Discounts managed via Shopify - local model not implemented',
  }, { status: 501 });
}
