/**
 * PATCH /api/v2/group-orders/[code]/tabs/[tabId] - Update tab (host only)
 * DELETE /api/v2/group-orders/[code]/tabs/[tabId] - Delete tab (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { UpdateTabSchema } from '@/lib/group-orders-v2/validation';
import {
  getGroupOrderByCode,
  updateTab,
  deleteTab,
  isParticipantHost,
} from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string; tabId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, tabId } = await params;
    const body = await request.json();

    const hostParticipantId = body.hostParticipantId;
    if (!hostParticipantId) {
      return NextResponse.json(
        { success: false, error: 'hostParticipantId is required' },
        { status: 400 }
      );
    }

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const isHost = await isParticipantHost(hostParticipantId, group.id);
    if (!isHost) {
      return NextResponse.json(
        { success: false, error: 'Only the host can update tabs' },
        { status: 403 }
      );
    }

    const parsed = UpdateTabSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tab = await updateTab(tabId, parsed.data);
    return NextResponse.json({ success: true, data: tab });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update tab';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, tabId } = await params;
    const hostParticipantId = request.nextUrl.searchParams.get('hostParticipantId');
    if (!hostParticipantId) {
      return NextResponse.json(
        { success: false, error: 'hostParticipantId is required' },
        { status: 400 }
      );
    }

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const isHost = await isParticipantHost(hostParticipantId, group.id);
    if (!isHost) {
      return NextResponse.json(
        { success: false, error: 'Only the host can delete tabs' },
        { status: 403 }
      );
    }

    await deleteTab(tabId);
    return NextResponse.json({ success: true, message: 'Tab deleted' });
  } catch (error) {
    console.error('[Group V2] Delete tab error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tab' },
      { status: 500 }
    );
  }
}
