/**
 * Admin Group Order API - Get by ID
 * GET /api/v1/admin/group-orders/[id] - Get group order details with participants and orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        hostCustomer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        participants: {
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        orders: {
          include: {
            items: {
              include: {
                product: { select: { title: true } },
              },
            },
          },
          orderBy: { orderNumber: 'asc' },
        },
      },
    });

    if (!groupOrder) {
      return NextResponse.json(
        { success: false, error: 'Group order not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalOrderValue = groupOrder.orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );
    const totalItems = groupOrder.orders.reduce(
      (sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    // Transform response
    const response = {
      id: groupOrder.id,
      name: groupOrder.name,
      shareCode: groupOrder.shareCode,
      status: groupOrder.status,
      deliveryDate: groupOrder.deliveryDate.toISOString(),
      deliveryTime: groupOrder.deliveryTime,
      deliveryAddress: groupOrder.deliveryAddress,
      minimumOrderAmount: Number(groupOrder.minimumOrderAmount),
      expiresAt: groupOrder.expiresAt.toISOString(),
      createdAt: groupOrder.createdAt.toISOString(),
      updatedAt: groupOrder.updatedAt.toISOString(),
      multiPaymentEnabled: groupOrder.multiPaymentEnabled,
      paymentDeadline: groupOrder.paymentDeadline?.toISOString() || null,
      hostDecision: groupOrder.hostDecision,
      hostDecisionAt: groupOrder.hostDecisionAt?.toISOString() || null,
      host: groupOrder.hostCustomer
        ? {
            id: groupOrder.hostCustomer.id,
            email: groupOrder.hostCustomer.email,
            name: [groupOrder.hostCustomer.firstName, groupOrder.hostCustomer.lastName]
              .filter(Boolean)
              .join(' ') || groupOrder.hostName,
            phone: groupOrder.hostCustomer.phone,
          }
        : {
            name: groupOrder.hostName,
          },
      participants: groupOrder.participants.map((p) => ({
        id: p.id,
        customerId: p.customerId,
        guestName: p.guestName,
        guestEmail: p.guestEmail,
        name: p.customer
          ? [p.customer.firstName, p.customer.lastName].filter(Boolean).join(' ')
          : p.guestName,
        email: p.customer?.email || p.guestEmail,
        cartId: p.cartId,
        cartTotal: Number(p.cartTotal),
        itemCount: p.itemCount,
        ageVerified: p.ageVerified,
        status: p.status,
        joinedAt: p.joinedAt.toISOString(),
        checkedOutAt: p.checkedOutAt?.toISOString() || null,
        shopifyOrderId: p.shopifyOrderId,
        shopifyOrderName: p.shopifyOrderName,
      })),
      orders: groupOrder.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        subtotal: Number(order.subtotal),
        taxAmount: Number(order.taxAmount),
        deliveryFee: Number(order.deliveryFee),
        total: Number(order.total),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        items: order.items.map((item) => ({
          id: item.id,
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: order.createdAt.toISOString(),
      })),
      summary: {
        participantCount: groupOrder.participants.length,
        orderCount: groupOrder.orders.length,
        totalOrderValue,
        totalItems,
        checkedOutCount: groupOrder.participants.filter(
          (p) => p.status === 'CHECKED_OUT'
        ).length,
      },
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('[Admin Group Order API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group order' },
      { status: 500 }
    );
  }
}
