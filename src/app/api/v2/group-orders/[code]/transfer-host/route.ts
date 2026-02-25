/**
 * POST /api/v2/group-orders/[code]/transfer-host - Transfer host role (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { transferHost } from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { hostParticipantId, newHostParticipantId } = await request.json();

    if (!hostParticipantId || !newHostParticipantId) {
      return NextResponse.json(
        { success: false, error: 'hostParticipantId and newHostParticipantId are required' },
        { status: 400 }
      );
    }

    await transferHost(code, hostParticipantId, newHostParticipantId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to transfer host';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
