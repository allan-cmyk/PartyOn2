/**
 * Orders API
 *
 * GET /api/v1/orders - List orders (admin or customer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getCustomerOrders } from '@/lib/inventory/services/order-service';
import type { OrderStatus, FulfillmentStatus, FinancialStatus } from '@prisma/client';

/**
 * GET /api/v1/orders
 * List orders with filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;

    // Check for customer-specific request
    const customerId = request.headers.get('x-customer-id');

    // Parse query params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status') as OrderStatus | null;
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') as FulfillmentStatus | null;
    const financialStatus = searchParams.get('financialStatus') as FinancialStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let result;

    if (customerId) {
      // Customer-specific orders
      result = await getCustomerOrders(customerId, { page, pageSize });
    } else {
      // Admin orders list (should verify admin auth in production)
      result = await getOrders({
        status: status || undefined,
        fulfillmentStatus: fulfillmentStatus || undefined,
        financialStatus: financialStatus || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page,
        pageSize,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: result.orders,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('[Orders API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get orders',
      },
      { status: 500 }
    );
  }
}
