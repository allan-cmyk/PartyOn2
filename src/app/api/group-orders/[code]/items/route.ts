import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database'

/**
 * Get aggregated items for a group order
 * Returns items that have been purchased (from completed checkouts)
 * Items are aggregated by title+variant (combines duplicates from different participants)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // Verify the group order exists
    const groupOrder = await db.getOrderByCode(code)
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      )
    }

    // Get aggregated items
    const items = await db.getGroupOrderItems(code)

    // Get checkout stats
    const stats = await db.getGroupCheckoutStats(code)

    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0)

    return NextResponse.json({
      items,
      stats,
      summary: {
        totalItems,
        totalValue,
        uniqueProducts: items.length,
      },
      groupOrder: {
        name: groupOrder.name,
        status: groupOrder.status,
        deliveryDate: groupOrder.deliveryDate,
        deliveryTime: groupOrder.deliveryTime,
      },
    })
  } catch (error) {
    console.error('Error fetching group order items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group order items' },
      { status: 500 }
    )
  }
}
