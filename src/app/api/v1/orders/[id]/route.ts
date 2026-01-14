/**
 * Single Order API
 *
 * GET /api/v1/orders/[id] - Get order by ID or order number
 * PATCH /api/v1/orders/[id] - Update order status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  updateFulfillmentStatus,
  createRefund,
} from '@/lib/inventory/services/order-service';
import type { OrderStatus, FulfillmentStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/orders/[id]
 * Get order by ID or order number
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Try to get by ID or order number
    // Order numbers are integers, IDs are UUIDs
    let order;
    const orderNum = parseInt(id, 10);
    if (!isNaN(orderNum) && String(orderNum) === id) {
      // It's a numeric string, try as order number
      order = await getOrderByNumber(orderNum);
    } else {
      // Try as UUID
      order = await getOrderById(id);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if customer is authorized to view this order
    const customerId = request.headers.get('x-customer-id');
    if (customerId && order.customerId !== customerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('[Orders API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/orders/[id]
 * Update order status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Verify admin authorization
    const adminKey = process.env.ADMIN_API_KEY;
    const authHeader = request.headers.get('authorization');

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, fulfillmentStatus, refund } = body;

    // Get current order
    let order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    if (status) {
      order = await updateOrderStatus(id, status as OrderStatus);
    }

    // Update fulfillment status
    if (fulfillmentStatus) {
      order = await updateFulfillmentStatus(id, fulfillmentStatus as FulfillmentStatus);
    }

    // Process refund
    if (refund && refund.amount > 0) {
      await createRefund(id, refund.amount, refund.reason);
      // Re-fetch order to get updated state
      order = await getOrderById(id);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found after refund' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('[Orders API] PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      },
      { status: 500 }
    );
  }
}
