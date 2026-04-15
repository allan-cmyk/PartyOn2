/**
 * GET /api/public/boat-schedule/order/[orderNumber]
 *
 * Captain-facing order detail. Authenticated via PREMIER_SCHEDULE_PUBLIC_KEY
 * (header or pbs_key cookie). Omits internal notes, financial status, and
 * pricing the captains don't need.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.PREMIER_SCHEDULE_PUBLIC_KEY;
  if (!expected) return false;
  const header = req.headers.get('x-public-key');
  const cookie = req.cookies.get('pbs_key')?.value;
  return header === expected || cookie === expected;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

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
            include: { purchasedItems: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    fulfillmentStatus: order.fulfillmentStatus,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryPhone: order.deliveryPhone,
    deliveryDate: order.deliveryDate,
    deliveryTime: order.deliveryTime,
    deliveryAddress: order.deliveryAddress,
    deliveryInstructions: order.deliveryInstructions,
    customerNote: order.customerNote,
    items: order.items.map(i => ({
      id: i.id,
      title: i.title,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
    })),
    groupOrderV2: order.groupOrderV2
      ? {
          shareCode: order.groupOrderV2.shareCode,
          name: order.groupOrderV2.name,
          tabs: order.groupOrderV2.tabs.map(t => ({
            id: t.id,
            name: t.name,
            status: t.status,
            itemCount: t.purchasedItems.length,
            items: t.purchasedItems.map(p => ({
              title: p.title,
              variantTitle: p.variantTitle,
              quantity: p.quantity,
            })),
          })),
        }
      : null,
  });
}
