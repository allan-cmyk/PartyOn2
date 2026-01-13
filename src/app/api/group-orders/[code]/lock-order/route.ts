import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database'

/**
 * Close a group order (prevents new participants from joining)
 * This is optional - hosts can close the group when they don't want more people joining.
 * Participants can still check out after the group is closed.
 * No minimum order validation - individual checkout model.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  try {
    const { hostCustomerId } = await request.json()

    if (!hostCustomerId) {
      return NextResponse.json(
        { error: 'Host customer ID required' },
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
        { error: 'Only the host can close the group' },
        { status: 403 }
      )
    }

    // Check if already closed or in a terminal state
    if (groupOrder.status === 'closed' || groupOrder.status === 'locked') {
      return NextResponse.json(
        { error: 'Group is already closed' },
        { status: 400 }
      )
    }

    if (groupOrder.status === 'completed' || groupOrder.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot close a group that is already completed or cancelled' },
        { status: 400 }
      )
    }

    // Close the group (use 'closed' status - prevents new joins)
    const closedOrder = await db.updateOrderStatus(code, 'closed')

    if (!closedOrder) {
      return NextResponse.json(
        { error: 'Failed to close group' },
        { status: 500 }
      )
    }

    // Get checkout stats for the response
    const stats = await db.getGroupCheckoutStats(code)

    return NextResponse.json({
      success: true,
      groupOrder: closedOrder,
      stats,
      message: 'Group closed. No new participants can join. Existing participants can still checkout.',
    })
  } catch (error) {
    console.error('Error closing group:', error)
    return NextResponse.json(
      { error: 'Failed to close group' },
      { status: 500 }
    )
  }
}