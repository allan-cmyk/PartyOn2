/**
 * Admin Single Customer API
 * GET /api/v1/admin/customers/[id] - Get customer details
 * PUT /api/v1/admin/customers/[id] - Update customer
 *
 * Note: Customer model not yet in Prisma schema - using Shopify API directly
 */

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Customer management via Shopify Admin API - local Customer model not implemented',
    customerId: id,
  }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'Customer management via Shopify Admin API - local Customer model not implemented',
    customerId: id,
  }, { status: 501 });
}
