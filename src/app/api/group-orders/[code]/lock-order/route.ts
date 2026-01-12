import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
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
        { error: 'Only the host can lock the order' },
        { status: 403 }
      )
    }

    // Check if already locked
    if (groupOrder.status === 'locked') {
      return NextResponse.json(
        { error: 'Order is already locked' },
        { status: 400 }
      )
    }

    // Validate minimum order amount ($150)
    const totalAmount = groupOrder.participants
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + (p.cartTotal || 0), 0)

    if (totalAmount < groupOrder.minimumOrderAmount) {
      return NextResponse.json(
        {
          error: 'Minimum order amount not met',
          required: groupOrder.minimumOrderAmount,
          current: totalAmount
        },
        { status: 400 }
      )
    }

    // Lock the order
    const lockedOrder = await db.updateOrderStatus(code, 'locked')

    if (!lockedOrder) {
      return NextResponse.json(
        { error: 'Failed to lock order' },
        { status: 500 }
      )
    }

    // Return the locked order - checkout creation will be a separate step
    return NextResponse.json({
      success: true,
      groupOrder: lockedOrder,
      nextStep: 'create_checkout',
      checkoutUrl: `/group/checkout/${code}`
    })
  } catch (error) {
    console.error('Error locking order:', error)
    return NextResponse.json(
      { error: 'Failed to lock order' },
      { status: 500 }
    )
  }
}