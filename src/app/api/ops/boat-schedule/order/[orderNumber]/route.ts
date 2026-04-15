/**
 * GET /api/ops/boat-schedule/order/[orderNumber]
 *
 * Returns full order detail for the boat schedule modal: customer info,
 * delivery info, items, totals, and group-order tabs if applicable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { requireOpsAuth } from '@/lib/auth/ops-session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const { orderNumber: orderNumberStr } = await params;
  const orderNumber = parseInt(orderNumberStr, 10);
  if (isNaN(orderNumber)) {
    return NextResponse.json({ error: 'Invalid order number' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: {
      items: true,
      groupOrderV2: {
        include: {
          tabs: {
            include: {
              purchasedItems: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryPhone: order.deliveryPhone,
    deliveryDate: order.deliveryDate,
    deliveryTime: order.deliveryTime,
    deliveryAddress: order.deliveryAddress,
    deliveryInstructions: order.deliveryInstructions,
    customerNote: order.customerNote,
    internalNote: order.internalNote,
    subtotal: Number(order.subtotal),
    discountCode: order.discountCode,
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    deliveryFee: Number(order.deliveryFee),
    tipAmount: Number(order.tipAmount),
    total: Number(order.total),
    createdAt: order.createdAt,
    items: order.items.map(i => ({
      id: i.id,
      title: i.title,
      variantTitle: i.variantTitle,
      sku: i.sku,
      price: Number(i.price),
      quantity: i.quantity,
      totalPrice: Number(i.totalPrice),
      fulfilledQuantity: i.fulfilledQuantity,
      refundedQuantity: i.refundedQuantity,
    })),
    groupOrderV2: order.groupOrderV2
      ? {
          id: order.groupOrderV2.id,
          shareCode: order.groupOrderV2.shareCode,
          name: order.groupOrderV2.name,
          status: order.groupOrderV2.status,
          tabs: order.groupOrderV2.tabs.map(t => ({
            id: t.id,
            name: t.name,
            status: t.status,
            deliveryDate: t.deliveryDate,
            deliveryTime: t.deliveryTime,
            itemCount: t.purchasedItems.length,
            items: t.purchasedItems.map(p => ({
              title: p.title,
              variantTitle: p.variantTitle,
              quantity: p.quantity,
              price: Number(p.price),
            })),
          })),
        }
      : null,
  });
}
