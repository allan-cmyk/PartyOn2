/**
 * Admin Customers API
 * GET /api/v1/admin/customers - List all customers
 *
 * Note: Customer model not yet in Prisma schema - using Shopify API directly
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Customer management via Shopify Admin API - local Customer model not implemented',
    data: {
      customers: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    },
  }, { status: 501 });
}
