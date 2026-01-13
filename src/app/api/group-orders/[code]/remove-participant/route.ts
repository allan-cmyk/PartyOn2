import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { participantId, hostCustomerId } = await request.json()

    if (!participantId || !hostCustomerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const groupOrder = await db.getOrderByCode(code)
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

    const removed = await db.removeParticipant(code, participantId)

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