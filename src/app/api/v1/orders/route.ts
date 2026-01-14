/**
 * Orders API
 * Note: Local Order model not implemented - orders managed via Shopify
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Orders managed via Shopify Admin API - local Order model not implemented',
    data: {
      orders: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      },
    },
  }, { status: 501 });
}
