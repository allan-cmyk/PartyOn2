/**
 * DELETE /api/v2/group-orders/[code]/participants/[pid] - Remove participant (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGroupOrderByCode,
  removeParticipant,
  isParticipantHost,
} from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string; pid: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, pid } = await params;
    const hostParticipantId = request.nextUrl.searchParams.get('hostParticipantId');
    if (!hostParticipantId) {
      return NextResponse.json(
        { success: false, error: 'hostParticipantId is required' },
        { status: 400 }
      );
    }

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group order not found' },
        { status: 404 }
      );
    }

    const isHost = await isParticipantHost(hostParticipantId, group.id);
    if (!isHost) {
      return NextResponse.json(
        { success: false, error: 'Only the host can remove participants' },
        { status: 403 }
      );
    }

    await removeParticipant(group.id, pid);

    return NextResponse.json({ success: true, message: 'Participant removed' });
  } catch (error) {
    console.error('[Group V2] Remove participant error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}
