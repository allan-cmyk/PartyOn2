import { NextRequest, NextResponse } from 'next/server'
import { groupOrderStore } from '@/lib/group-orders/store'

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { participantId, hostCustomerId } = await request.json()

    if (!participantId || !hostCustomerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Verify the requester is the host
    if (groupOrder.hostCustomerId !== hostCustomerId) {
      return NextResponse.json(
        { error: 'Only the host can remove participants' },
        { status: 403 }
      )
    }

    const removed = groupOrderStore.removeParticipant(groupOrder.id, participantId)
    
    if (!removed) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Participant removed successfully'
    })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    )
  }
}