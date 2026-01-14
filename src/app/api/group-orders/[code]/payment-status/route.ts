/**
 * Group Order Payment Status API
 * GET /api/group-orders/[code]/payment-status
 *
 * Returns payment status summary for all participants in a group order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getGroupPaymentSummary } from '@/lib/stripe/group-payments';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { code } = await params;

    // Get the group order
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { shareCode: code },
      select: {
        id: true,
        name: true,
        shareCode: true,
        status: true,
        hostCustomerId: true,
        minimumOrderAmount: true,
        paymentDeadline: true,
        hostDecision: true,
        hostDecisionAt: true,
        totalPaid: true,
        totalExpected: true,
        deliveryDate: true,
        deliveryTime: true,
      },
    });

    if (!groupOrder) {
      return NextResponse.json(
        { success: false, error: 'Group order not found' },
        { status: 404 }
      );
    }

    // Get detailed payment summary
    const paymentSummary = await getGroupPaymentSummary(groupOrder.id);

    if (!paymentSummary) {
      return NextResponse.json(
        { success: false, error: 'Failed to get payment summary' },
        { status: 500 }
      );
    }

    // Check if deadline has passed
    const deadlinePassed = groupOrder.paymentDeadline
      ? new Date() > new Date(groupOrder.paymentDeadline)
      : false;

    // Determine if host decision is needed
    const needsHostDecision =
      deadlinePassed &&
      !groupOrder.hostDecision &&
      paymentSummary.pendingCount > 0 &&
      paymentSummary.paidCount > 0;

    return NextResponse.json({
      success: true,
      data: {
        groupOrder: {
          id: groupOrder.id,
          name: groupOrder.name,
          shareCode: groupOrder.shareCode,
          status: groupOrder.status,
          minimumOrderAmount: Number(groupOrder.minimumOrderAmount),
          deliveryDate: groupOrder.deliveryDate?.toISOString(),
          deliveryTime: groupOrder.deliveryTime,
        },
        payment: {
          totalExpected: paymentSummary.totalExpected,
          totalPaid: paymentSummary.totalPaid,
          totalPending: paymentSummary.totalPending,
          isFullyPaid: paymentSummary.isFullyPaid,
          meetsMinimum: paymentSummary.totalPaid >= Number(groupOrder.minimumOrderAmount),
        },
        participants: {
          total: paymentSummary.participantCount,
          paid: paymentSummary.paidCount,
          pending: paymentSummary.pendingCount,
          failed: paymentSummary.failedCount,
        },
        payments: paymentSummary.payments,
        deadline: {
          deadline: groupOrder.paymentDeadline?.toISOString() || null,
          passed: deadlinePassed,
          needsHostDecision,
        },
        hostDecision: groupOrder.hostDecision
          ? {
              decision: groupOrder.hostDecision,
              madeAt: groupOrder.hostDecisionAt?.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[Payment Status API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
