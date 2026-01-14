/**
 * Admin Automatic Discounts API
 * Note: Discount model not in Prisma schema - using Shopify for discounts
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Discounts managed via Shopify - local model not implemented',
    data: [],
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Discounts managed via Shopify - local model not implemented',
  }, { status: 501 });
}
