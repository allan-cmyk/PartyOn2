/**
 * Apply AI Inventory Count API
 * Note: AI Inventory models not in Prisma schema - feature not implemented
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    error: 'AI inventory counting not implemented - models not in schema',
    countId: id,
  }, { status: 501 });
}
