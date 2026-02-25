/**
 * POST /api/v2/group-orders/[code]/claim-host - Claim host role using a claim token
 */

import { NextRequest, NextResponse } from 'next/server';
import { claimHost } from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { claimToken, participantId } = await request.json();

    if (!claimToken || !participantId) {
      return NextResponse.json(
        { success: false, error: 'claimToken and participantId are required' },
        { status: 400 }
      );
    }

    await claimHost(code, claimToken, participantId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to claim host';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
