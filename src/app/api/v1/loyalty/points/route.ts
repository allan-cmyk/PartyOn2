/**
 * Customer Loyalty Points API
 * GET /api/v1/loyalty/points - Get customer's loyalty status
 * POST /api/v1/loyalty/points - Award bonus points (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateLoyalty,
  getPointsHistory,
  awardBonusPoints,
  calculatePointsValue,
} from '@/lib/loyalty/loyalty-service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const customerId = request.nextUrl.searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const loyalty = await getOrCreateLoyalty(customerId);
    const history = await getPointsHistory(customerId, 10);

    return NextResponse.json({
      success: true,
      data: {
        ...loyalty,
        pointsValue: calculatePointsValue(loyalty.points),
        history: history.map((h) => ({
          id: h.id,
          type: h.type,
          points: h.points,
          description: h.description,
          createdAt: h.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('[Loyalty Points API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { customerId, points, description } = body;

    if (!customerId || !points) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and points required' },
        { status: 400 }
      );
    }

    const result = await awardBonusPoints(
      customerId,
      points,
      description || 'Bonus points'
    );

    return NextResponse.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        message: `${points} bonus points awarded`,
      },
    });
  } catch (error) {
    console.error('[Loyalty Points API] Error awarding points:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to award points' },
      { status: 500 }
    );
  }
}
