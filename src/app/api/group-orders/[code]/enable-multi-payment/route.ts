import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'
import type { GroupParticipant } from '@prisma/client'

interface RouteParams {
  params: Promise<{ code: string }>
}

/**
 * POST /api/group-orders/[code]/enable-multi-payment
 * Enable multi-payment mode for a group order and set payment deadline
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { code } = await params
    const body = await request.json()
    const { hostCustomerId, paymentDeadline } = body

    if (!hostCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Host customer ID is required' },
        { status: 400 }
      )
    }

    if (!paymentDeadline) {
      return NextResponse.json(
        { success: false, error: 'Payment deadline is required' },
        { status: 400 }
      )
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(paymentDeadline)
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Payment deadline must be in the future' },
        { status: 400 }
      )
    }

    // Find the group order
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { shareCode: code },
      include: {
        participants: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!groupOrder) {
      return NextResponse.json(
        { success: false, error: 'Group order not found' },
        { status: 404 }
      )
    }

    // Verify the requester is the host
    if (groupOrder.hostCustomerId !== hostCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Only the host can enable multi-payment' },
        { status: 403 }
      )
    }

    // Check group order status
    if (groupOrder.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Group order is no longer active' },
        { status: 400 }
      )
    }

    // Check if already in multi-payment mode
    if (groupOrder.multiPaymentEnabled) {
      return NextResponse.json(
        { success: false, error: 'Multi-payment is already enabled' },
        { status: 400 }
      )
    }

    // Update the group order to enable multi-payment
    const updatedGroupOrder = await prisma.groupOrder.update({
      where: { id: groupOrder.id },
      data: {
        multiPaymentEnabled: true,
        paymentDeadline: deadlineDate,
      },
    })

    // Create payment records for each participant
    const participantsWithCarts = groupOrder.participants.filter(
      (p: GroupParticipant) => p.cartTotal && Number(p.cartTotal) > 0
    )

    if (participantsWithCarts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants with items in their carts' },
        { status: 400 }
      )
    }

    // Calculate delivery fee split
    const deliveryFee = 15 // Base delivery fee
    const deliveryPerPerson = deliveryFee / participantsWithCarts.length

    // Create payment records
    const paymentPromises = participantsWithCarts.map(async (participant: GroupParticipant) => {
      const subtotal = Number(participant.cartTotal) || 0
      const taxAmount = Math.round(subtotal * 0.0825 * 100) / 100 // Texas 8.25% sales tax
      const deliveryContribution = Math.round(deliveryPerPerson * 100) / 100
      const total = Math.round((subtotal + taxAmount + deliveryContribution) * 100) / 100

      return prisma.groupOrderPayment.create({
        data: {
          groupOrderId: groupOrder.id,
          participantId: participant.id,
          subtotal,
          taxAmount,
          deliveryContribution,
          total,
          status: 'PENDING',
          expiresAt: deadlineDate,
        },
      })
    })

    await Promise.all(paymentPromises)

    return NextResponse.json({
      success: true,
      data: {
        groupOrderId: updatedGroupOrder.id,
        multiPaymentEnabled: true,
        paymentDeadline: deadlineDate.toISOString(),
        participantCount: participantsWithCarts.length,
      },
    })
  } catch (error) {
    console.error('Error enabling multi-payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to enable multi-payment' },
      { status: 500 }
    )
  }
}
