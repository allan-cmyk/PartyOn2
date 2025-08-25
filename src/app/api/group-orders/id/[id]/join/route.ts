import { NextRequest, NextResponse } from 'next/server'
import { JoinGroupOrderInput } from '@/lib/group-orders/types'
import { db } from '@/lib/group-orders/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: JoinGroupOrderInput = await request.json()
    
    // Find group order by ID
    const groupOrder = await db.getOrderById(id)
    
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      )
    }

    // Check if order is still active
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
      customerId: body.customerId,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      cartId: body.cartId,
      ageVerified: false, // Will be verified later
      status: 'active',
      joinedAt: new Date().toISOString(),
      cartTotal: 0,
      itemCount: 0,
    }

    // Add to participants
    await db.addParticipant(id, participant)

    return NextResponse.json({
      participantId: participant.id,
      groupOrderId: id,
    })
  } catch (error) {
    console.error('Error joining group order:', error)
    return NextResponse.json(
      { error: 'Failed to join group order' },
      { status: 500 }
    )
  }
}