/**
 * POST /api/v2/group-orders/[code]/host-claim-token - Generate host claim token (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHostClaimToken } from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { hostParticipantId } = await request.json();

    if (!hostParticipantId) {
      return NextResponse.json(
        { success: false, error: 'hostParticipantId is required' },
        { status: 400 }
      );
    }

    const token = await generateHostClaimToken(code, hostParticipantId);
    return NextResponse.json({ success: true, data: { token } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate claim token';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
