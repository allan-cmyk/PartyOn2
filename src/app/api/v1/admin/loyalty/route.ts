/**
 * Admin Loyalty API
 * Note: Loyalty models not in Prisma schema - loyalty system temporarily disabled
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Loyalty system temporarily disabled - models not implemented',
    data: {
      tiers: [],
      summary: {
        totalCustomers: 0,
        totalPointsOutstanding: 0,
        totalLifetimeSpend: 0,
        totalPointsEarned: 0,
      },
      recentTransactions: [],
    },
  }, { status: 501 });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Loyalty system temporarily disabled - models not implemented',
  }, { status: 501 });
}
