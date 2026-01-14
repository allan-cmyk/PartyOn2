/**
 * Loyalty Points Redemption API
 * POST /api/v1/loyalty/redeem - Redeem points for discount
 */

import { NextRequest, NextResponse } from 'next/server';
import { redeemPoints, calculatePointsValue } from '@/lib/loyalty/loyalty-service';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { customerId, points } = body;

    if (!customerId || !points) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and points required' },
        { status: 400 }
      );
    }

    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { success: false, error: 'Points must be a positive number' },
        { status: 400 }
      );
    }

    const result = await redeemPoints(customerId, points);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        discountAmount: result.discountAmount,
        newBalance: result.newBalance,
        message: `Redeemed ${points} points for $${result.discountAmount.toFixed(2)} discount`,
      },
    });
  } catch (error) {
    console.error('[Loyalty Redeem API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem points' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/loyalty/redeem - Calculate redemption value
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const points = parseInt(request.nextUrl.searchParams.get('points') || '0');

    if (points < 100) {
      return NextResponse.json({
        success: true,
        data: {
          points,
          value: 0,
          message: 'Minimum 100 points required for redemption',
        },
      });
    }

    const value = calculatePointsValue(points);

    return NextResponse.json({
      success: true,
      data: {
        points,
        value,
        formattedValue: `$${value.toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('[Loyalty Redeem API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate redemption value' },
      { status: 500 }
    );
  }
}
