import { NextRequest, NextResponse } from 'next/server'
import { groupOrderStore } from '@/lib/group-orders/store'

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { cartId, cartTotal, itemCount } = await request.json()

    if (!cartId || typeof cartTotal !== 'number' || typeof itemCount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      )
    }

    const groupOrder = groupOrderStore.getOrderByCode(params.code)
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      )
    }

    const updatedParticipant = groupOrderStore.updateParticipantCart(
      groupOrder.id,
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