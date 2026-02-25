/**
 * Group Order Participant Checkout API
 * POST /api/group-orders/[code]/participant-checkout
 *
 * Creates a Stripe checkout session for an individual participant in a group order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import {
  createParticipantCheckoutSession,
  calculateDeliveryContribution,
  calculateParticipantTax,
  ParticipantCartItem,
} from '@/lib/stripe/group-payments';

interface RequestBody {
  participantId: string;
  items: ParticipantCartItem[];
  customerEmail?: string;
  customerName?: string;
}

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { code } = await params;
    const body: RequestBody = await request.json();
    const { participantId, items, customerEmail, customerName } = body;

    // Validate required fields
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Get the group order with all participants and their payments
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { shareCode: code },
      include: {
        participants: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!groupOrder) {
      return NextResponse.json(
        { success: false, error: 'Group order not found' },
        { status: 404 }
      );
    }

    // Check if group order is still active
    if (groupOrder.status !== 'ACTIVE' && groupOrder.status !== 'LOCKED') {
      return NextResponse.json(
        { success: false, error: `Group order is ${groupOrder.status.toLowerCase()} and cannot accept payments` },
        { status: 400 }
      );
    }

    // Verify participant exists in this group order
    const participant = groupOrder.participants.find((p) => p.id === participantId);
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found in this group order' },
        { status: 404 }
      );
    }

    // Check if participant has already paid
    if (participant.payments?.some(p => p.status === 'PAID')) {
      return NextResponse.json(
        { success: false, error: 'Participant has already paid' },
        { status: 400 }
      );
    }

    // Calculate participant's subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate all participants' subtotals for delivery fee split
    const allParticipantsSubtotal = groupOrder.participants.reduce((sum, p) => {
      return sum + Number(p.cartTotal || 0);
    }, 0);

    // Total delivery fee (from group order or default)
    const totalDeliveryFee = 30; // Default delivery fee

    // Calculate this participant's share of delivery fee
    const deliveryContribution = calculateDeliveryContribution(
      subtotal,
      allParticipantsSubtotal > 0 ? allParticipantsSubtotal : subtotal,
      totalDeliveryFee
    );

    // Calculate tax on subtotal
    const taxAmount = calculateParticipantTax(subtotal);

    // Calculate total
    const total = Math.round((subtotal + taxAmount + deliveryContribution) * 100) / 100;

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/group/payment-success`;
    const cancelUrl = `${baseUrl}/group/${code}`;

    // Calculate expiration (use group order deadline or 24 hours)
    let expiresAt: Date | undefined;
    if (groupOrder.paymentDeadline) {
      expiresAt = new Date(groupOrder.paymentDeadline);
    }

    // Create checkout session
    const session = await createParticipantCheckoutSession({
      groupOrderId: groupOrder.id,
      participantId,
      items,
      subtotal,
      taxAmount,
      deliveryContribution,
      total,
      customerEmail: customerEmail || participant.guestEmail || undefined,
      customerName: customerName || participant.guestName || undefined,
      successUrl,
      cancelUrl,
      expiresAt,
    });

    // Update participant cart total
    await prisma.groupParticipant.update({
      where: { id: participantId },
      data: {
        cartTotal: subtotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        breakdown: {
          subtotal,
          taxAmount,
          deliveryContribution,
          total,
        },
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('[Group Checkout API] Error:', error);

    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes('already paid')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('being processed')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
