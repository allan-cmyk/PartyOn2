/**
 * POST /api/v2/group-orders/[code]/tabs/[tabId]/checkout
 * Create Stripe checkout session for participant's items in this tab
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import {
  getGroupOrderByCode,
  getParticipantDraftItems,
  getParticipantById,
} from '@/lib/group-orders-v2/service';
import { createGroupV2CheckoutSession } from '@/lib/stripe/group-v2-payments';

interface RouteParams {
  params: Promise<{ code: string; tabId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, tabId } = await params;
    const body = await request.json();
    const { participantId, discountCode, tipAmount, email } = body;

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'participantId is required' },
        { status: 400 }
      );
    }

    // Verify group + tab
    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }
    const tab = group.tabs.find((t) => t.id === tabId);
    if (!tab) {
      return NextResponse.json({ success: false, error: 'Tab not found' }, { status: 404 });
    }

    // Get participant
    const participant = await getParticipantById(participantId);
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Get their draft items for this tab
    const draftItems = await getParticipantDraftItems(tabId, participantId);
    if (draftItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items to checkout' },
        { status: 400 }
      );
    }

    // Save email to participant if provided and they don't have one
    const effectiveEmail = email || participant.guestEmail || undefined;
    if (email && !participant.guestEmail) {
      try {
        await prisma.groupParticipantV2.update({
          where: { id: participantId },
          data: { guestEmail: email },
        });
      } catch (err) {
        // Unique constraint violation -- another participant has this email in the same group
        if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
          return NextResponse.json(
            { success: false, error: 'This email is already in use by another participant in this group' },
            { status: 409 }
          );
        }
        console.error('[Group V2] Failed to save participant email:', err);
      }
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const result = await createGroupV2CheckoutSession({
      groupOrderId: group.id,
      subOrderId: tabId,
      participantId,
      participantEmail: effectiveEmail,
      participantName: participant.guestName || 'Guest',
      draftItems,
      discountCode,
      tipAmount: tipAmount ? Number(tipAmount) : undefined,
      successUrl: `${appUrl}/dashboard/${code}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/dashboard/${code}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl,
        sessionId: result.sessionId,
        paymentId: result.paymentId,
      },
    });
  } catch (error) {
    console.error('[Group V2] Checkout error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create checkout';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
