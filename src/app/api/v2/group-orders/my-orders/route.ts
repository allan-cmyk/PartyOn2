/**
 * GET /api/v2/group-orders/my-orders - List user's group orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMyGroupOrders } from '@/lib/group-orders-v2/service';

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'customerId is required' },
        { status: 400 }
      );
    }

    const groups = await getMyGroupOrders(customerId);

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    console.error('[Group V2] My orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group orders' },
      { status: 500 }
    );
  }
}
