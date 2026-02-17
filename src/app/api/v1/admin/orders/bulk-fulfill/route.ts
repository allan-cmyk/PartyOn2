/**
 * Bulk Fulfill Orders API
 * PATCH /api/v1/admin/orders/bulk-fulfill
 * Sets fulfillmentStatus to FULFILLED and status to COMPLETED for multiple orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { FulfillmentStatus, OrderStatus } from '@prisma/client';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { orderIds } = body as { orderIds: string[] };

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (orderIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Cannot fulfill more than 100 orders at once' },
        { status: 400 }
      );
    }

    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        fulfillmentStatus: { not: FulfillmentStatus.DELIVERED },
      },
      data: {
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
        status: OrderStatus.COMPLETED,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count,
        requestedCount: orderIds.length,
      },
    });
  } catch (error) {
    console.error('[Bulk Fulfill API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fulfill orders' },
      { status: 500 }
    );
  }
}
