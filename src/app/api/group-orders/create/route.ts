import { NextRequest, NextResponse } from 'next/server'
import { CreateGroupOrderInput } from '@/lib/group-orders/types'
import { db } from '@/lib/group-orders/database'

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateGroupOrderInput = await request.json()
    
    // Validate required fields
    if (!body.name || !body.deliveryDate || !body.deliveryTime || !body.deliveryAddress || !body.customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique share code
    let shareCode = generateShareCode()
    while (await db.getOrderByCode(shareCode)) {
      shareCode = generateShareCode()
    }

    // Create group order
    const groupOrder = {
      id: `group_${Date.now()}`,
      name: body.name,
      hostCustomerId: body.customerId,
      hostName: body.customerName,
      shareCode,
      status: 'active' as const,
      deliveryDate: body.deliveryDate,
      deliveryTime: body.deliveryTime,
      deliveryAddress: body.deliveryAddress,
      minimumOrderAmount: 0, // No minimum - individual checkout model with free delivery
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: [],
      totalAmount: 0,
      totalItems: 0,
    }

    // Store in database
    const savedOrder = await db.createOrder(groupOrder)

    // Return group order with share data
    return NextResponse.json({
      ...savedOrder,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/group/${shareCode}`,
    })
  } catch (error) {
    console.error('Error creating group order:', error)
    return NextResponse.json(
      { error: 'Failed to create group order' },
      { status: 500 }
    )
  }
}