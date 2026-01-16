/**
 * Admin Single Order API
 * GET /api/v1/admin/orders/[id] - Get order details
 * PUT /api/v1/admin/orders/[id] - Update order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { OrderStatus, FinancialStatus, FulfillmentStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, title: true, handle: true },
            },
            variant: {
              select: { id: true, title: true, sku: true },
            },
          },
        },
        groupOrder: {
          select: {
            id: true,
            name: true,
            shareCode: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse delivery address
    const deliveryAddress = order.deliveryAddress as {
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };

    // Fetch sibling orders if this is a group order
    let siblingOrders: { id: string; orderNumber: string; customerName: string; total: number; status: string }[] = [];
    if (order.groupOrderId) {
      const siblings = await prisma.order.findMany({
        where: {
          groupOrderId: order.groupOrderId,
          id: { not: order.id }, // Exclude current order
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
        },
        orderBy: { orderNumber: 'asc' },
      });
      siblingOrders = siblings.map((s) => ({
        id: s.id,
        orderNumber: String(s.orderNumber),
        customerName: s.customerName || 'Guest',
        total: Number(s.total),
        status: String(s.status),
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        customer: {
          id: order.customer.id,
          email: order.customer.email,
          name: [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ') || order.customerEmail,
          phone: order.customer.phone,
        },
        customerSnapshot: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        items: order.items.map((item) => ({
          id: item.id,
          product: {
            id: item.product.id,
            title: item.product.title,
            handle: item.product.handle,
          },
          variant: item.variant ? {
            id: item.variant.id,
            title: item.variant.title,
            sku: item.variant.sku,
          } : null,
          title: item.title,
          variantTitle: item.variantTitle,
          sku: item.sku,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.totalPrice),
        })),
        pricing: {
          subtotal: Number(order.subtotal),
          discountCode: order.discountCode,
          discountAmount: Number(order.discountAmount),
          taxAmount: Number(order.taxAmount),
          deliveryFee: Number(order.deliveryFee),
          total: Number(order.total),
        },
        delivery: {
          date: order.deliveryDate.toISOString(),
          time: order.deliveryTime,
          type: order.deliveryType,
          address: {
            address1: deliveryAddress.address1 || '',
            address2: deliveryAddress.address2 || '',
            city: deliveryAddress.city || '',
            state: deliveryAddress.state || '',
            zip: deliveryAddress.zip || '',
            country: deliveryAddress.country || 'US',
          },
          phone: order.deliveryPhone,
          instructions: order.deliveryInstructions,
        },
        payment: {
          stripePaymentIntentId: order.stripePaymentIntentId,
          stripeCheckoutSessionId: order.stripeCheckoutSessionId,
          stripeChargeId: order.stripeChargeId,
        },
        shopify: {
          orderId: order.shopifyOrderId,
          orderNumber: order.shopifyOrderNumber,
        },
        groupOrder: {
          id: order.groupOrderId,
          isGroupOrder: !!order.groupOrderId,
          name: order.groupOrder?.name || null,
          shareCode: order.groupOrder?.shareCode || null,
          status: order.groupOrder?.status || null,
          siblingOrders,
        },
        notes: {
          customer: order.customerNote,
          internal: order.internalNote,
        },
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Order API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Update status fields
    if (body.status && Object.values(OrderStatus).includes(body.status)) {
      updateData.status = body.status;
    }
    if (body.financialStatus && Object.values(FinancialStatus).includes(body.financialStatus)) {
      updateData.financialStatus = body.financialStatus;
    }
    if (body.fulfillmentStatus && Object.values(FulfillmentStatus).includes(body.fulfillmentStatus)) {
      updateData.fulfillmentStatus = body.fulfillmentStatus;

      // Auto-update order status based on fulfillment
      if (body.fulfillmentStatus === 'FULFILLED') {
        updateData.status = 'COMPLETED';
      }
    }

    // Update notes
    if (body.internalNote !== undefined) {
      updateData.internalNote = body.internalNote;
    }
    if (body.customerNote !== undefined) {
      updateData.customerNote = body.customerNote;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Order API] Error updating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
