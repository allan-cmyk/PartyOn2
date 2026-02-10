/**
 * Group Order Host Decision API
 * POST /api/group-orders/[code]/host-decision
 *
 * Allows the host to make a decision when payment deadline passes with partial payments
 * - PROCEED_PARTIAL: Ship items for participants who paid
 * - CANCEL_REFUND_ALL: Cancel the entire order and refund everyone
 * - EXTEND_DEADLINE: Give more time for remaining payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { HostDecision } from '@prisma/client';
import { processHostDecision } from '@/lib/stripe/group-payments';

interface RequestBody {
  decision: 'PROCEED_PARTIAL' | 'CANCEL_REFUND_ALL' | 'EXTEND_DEADLINE';
  newDeadline?: string; // ISO date string for EXTEND_DEADLINE
  hostCustomerId?: string; // For verification
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
    const { decision, newDeadline, hostCustomerId } = body;

    // Validate decision
    const validDecisions: HostDecision[] = ['PROCEED_PARTIAL', 'CANCEL_REFUND_ALL', 'EXTEND_DEADLINE'];
    if (!decision || !validDecisions.includes(decision as HostDecision)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid decision. Must be PROCEED_PARTIAL, CANCEL_REFUND_ALL, or EXTEND_DEADLINE',
        },
        { status: 400 }
      );
    }

    // Get the group order
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { shareCode: code },
      include: {
        payments: {
          include: {
            participant: true,
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

    // Verify host (if provided)
    if (hostCustomerId && groupOrder.hostCustomerId !== hostCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Only the host can make this decision' },
        { status: 403 }
      );
    }

    // Check if decision already made
    if (groupOrder.hostDecision) {
      return NextResponse.json(
        {
          success: false,
          error: `Decision already made: ${groupOrder.hostDecision}`,
          existingDecision: {
            decision: groupOrder.hostDecision,
            madeAt: groupOrder.hostDecisionAt?.toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate deadline extension
    let parsedDeadline: Date | undefined;
    if (decision === 'EXTEND_DEADLINE') {
      if (!newDeadline) {
        return NextResponse.json(
          { success: false, error: 'New deadline is required for EXTEND_DEADLINE' },
          { status: 400 }
        );
      }

      parsedDeadline = new Date(newDeadline);
      if (isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid deadline format' },
          { status: 400 }
        );
      }

      // Ensure new deadline is in the future
      if (parsedDeadline <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'New deadline must be in the future' },
          { status: 400 }
        );
      }

      // Ensure new deadline is before delivery date
      if (parsedDeadline >= new Date(groupOrder.deliveryDate)) {
        return NextResponse.json(
          { success: false, error: 'New deadline must be before delivery date' },
          { status: 400 }
        );
      }
    }

    // Process the decision
    await processHostDecision(groupOrder.id, decision as HostDecision, parsedDeadline);

    // Prepare response based on decision
    let message: string;
    let details: Record<string, unknown> = {};

    switch (decision) {
      case 'PROCEED_PARTIAL': {
        const paidPayments = groupOrder.payments.filter((p) => p.status === 'PAID');
        const cancelledPayments = groupOrder.payments.filter((p) => p.status !== 'PAID');
        message = `Proceeding with ${paidPayments.length} paid participant(s). ${cancelledPayments.length} unpaid participant(s) removed.`;
        details = {
          paidParticipants: paidPayments.map((p) => ({
            name: p.participant.guestName || p.participant.guestEmail,
            amount: Number(p.total),
          })),
          cancelledParticipants: cancelledPayments.map((p) => ({
            name: p.participant.guestName || p.participant.guestEmail,
          })),
        };
        break;
      }

      case 'CANCEL_REFUND_ALL': {
        const refundedPayments = groupOrder.payments.filter((p) => p.status === 'PAID');
        message = `Order cancelled. ${refundedPayments.length} payment(s) will be refunded.`;
        details = {
          refundedParticipants: refundedPayments.map((p) => ({
            name: p.participant.guestName || p.participant.guestEmail,
            refundAmount: Number(p.total),
          })),
        };
        break;
      }

      case 'EXTEND_DEADLINE': {
        message = `Payment deadline extended to ${parsedDeadline?.toLocaleString()}`;
        details = {
          newDeadline: parsedDeadline?.toISOString(),
          pendingParticipants: groupOrder.payments
            .filter((p) => p.status === 'PENDING' || p.status === 'EXPIRED')
            .map((p) => ({
              name: p.participant.guestName || p.participant.guestEmail,
              amount: Number(p.total),
            })),
        };
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        decision,
        processedAt: new Date().toISOString(),
        ...details,
      },
    });
  } catch (error) {
    console.error('[Host Decision API] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process host decision' },
      { status: 500 }
    );
  }
}
