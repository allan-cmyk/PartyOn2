import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { cartId, cartTotal, itemCount } = await request.json()

    if (!cartId || typeof cartTotal !== 'number' || typeof itemCount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      )
    }

    // Verify the group order exists
    const groupOrder = await db.getOrderByCode(code)
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      )
    }

    // Update the participant's cart totals
    const updatedParticipant = await db.updateParticipantCart(
      code,
      cartId,
      cartTotal,
      itemCount
    )

    if (!updatedParticipant) {
      return NextResponse.json(
        { error: 'Participant not found in group order' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      participant: updatedParticipant
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart totals' },
      { status: 500 }
    )
  }
}