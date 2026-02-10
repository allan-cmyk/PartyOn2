import { NextRequest, NextResponse } from 'next/server'
import { JoinGroupOrderInput } from '@/lib/group-orders/types'
import { db } from '@/lib/group-orders/database'
import { setupGroupOrderCart } from '@/lib/group-orders/free-delivery'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: JoinGroupOrderInput = await request.json()

    // Validate customerId exists in DB if provided, otherwise drop it
    let validCustomerId: string | undefined = undefined
    if (body.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: body.customerId },
        select: { id: true },
      })
      if (customer) {
        validCustomerId = customer.id
      }
    }

    // Find group order by ID
    const groupOrder = await db.getOrderById(id)

    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      )
    }

    // Check if order is still accepting participants (active only, not closed/locked)
    if (groupOrder.status !== 'active') {
      return NextResponse.json(
        { error: 'Group order is no longer accepting participants' },
        { status: 400 }
      )
    }

    // Create participant
    const participant = {
      id: `participant_${Date.now()}`,
      groupOrderId: id,
      customerId: validCustomerId,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      cartId: body.cartId,
      ageVerified: false, // Will be verified later
      status: 'active' as const,
      joinedAt: new Date().toISOString(),
      cartTotal: 0,
      itemCount: 0,
    }

    // Add to participants
    await db.addParticipant(id, participant)

    // Apply free delivery discount and set cart attributes for group order
    const cartSetupResult = await setupGroupOrderCart(body.cartId, {
      shareCode: groupOrder.shareCode,
      groupName: groupOrder.name,
      deliveryDate: groupOrder.deliveryDate,
      deliveryTime: groupOrder.deliveryTime,
    })

    return NextResponse.json({
      participantId: participant.id,
      groupOrderId: id,
      freeDeliveryApplied: cartSetupResult.discountApplied,
      cartAttributesSet: cartSetupResult.attributesSet,
    })
  } catch (error) {
    console.error('Error joining group order:', error)
    return NextResponse.json(
      { error: 'Failed to join group order' },
      { status: 500 }
    )
  }
}