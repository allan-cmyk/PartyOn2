import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/group-orders/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params
    
    const groupOrder = await db.getOrderByCode(code)
    
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      )
    }

    // Return group order with participants
    return NextResponse.json(groupOrder)
  } catch (error) {
    console.error('Error fetching group order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group order' },
      { status: 500 }
    )
  }
}