/**
 * POST /api/v2/group-orders/[code]/tabs/[tabId]/delivery-invoice
 * Create Stripe session for host delivery fee payment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGroupOrderByCode,
  isParticipantHost,
} from '@/lib/group-orders-v2/service';
import { createDeliveryInvoiceSession } from '@/lib/stripe/group-v2-payments';

interface RouteParams {
  params: Promise<{ code: string; tabId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, tabId } = await params;
    const body = await request.json();
    const { hostParticipantId, discountCode } = body;

    if (!hostParticipantId) {
      return NextResponse.json(
        { success: false, error: 'hostParticipantId is required' },
        { status: 400 }
      );
    }

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const isHost = await isParticipantHost(hostParticipantId, group.id);
    if (!isHost) {
      return NextResponse.json(
        { success: false, error: 'Only the host can pay delivery fees' },
        { status: 403 }
      );
    }

    const tab = group.tabs.find((t) => t.id === tabId);
    if (!tab) {
      return NextResponse.json({ success: false, error: 'Tab not found' }, { status: 404 });
    }

    if (tab.deliveryFeeWaived) {
      return NextResponse.json(
        { success: false, error: 'Delivery fee has been waived' },
        { status: 400 }
      );
    }

    if (tab.deliveryInvoice?.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Delivery fee already paid' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const result = await createDeliveryInvoiceSession({
      groupOrderId: group.id,
      subOrderId: tabId,
      hostParticipantId,
      hostEmail: group.hostEmail || undefined,
      deliveryFee: tab.deliveryFee,
      discountCode,
      successUrl: `${appUrl}/group/${code}/dashboard?tab=${tabId}&delivery_paid=true`,
      cancelUrl: `${appUrl}/group/${code}/dashboard?tab=${tabId}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId,
        invoiceId: result.invoiceId,
      },
    });
  } catch (error) {
    console.error('[Group V2] Delivery invoice error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create invoice';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
