/**
 * PATCH /api/v2/group-orders/[code]/tabs/[tabId]/items/[itemId] - Update qty
 * DELETE /api/v2/group-orders/[code]/tabs/[tabId]/items/[itemId] - Remove item
 */

import { NextRequest, NextResponse } from 'next/server';
import { UpdateDraftItemSchema } from '@/lib/group-orders-v2/validation';
import {
  updateDraftItem,
  removeDraftItem,
  isParticipantHost,
  getGroupOrderByCode,
} from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string; tabId: string; itemId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, itemId } = await params;
    const body = await request.json();

    const participantId = body.participantId;
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'participantId is required' },
        { status: 400 }
      );
    }

    const parsed = UpdateDraftItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const isHost = await isParticipantHost(participantId, group.id);
    const item = await updateDraftItem(itemId, participantId, parsed.data.quantity, isHost);

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update item';
    const status = msg.includes('owner') || msg.includes('host') ? 403
      : msg.includes('locked') ? 403
      : msg.includes('not found') ? 404
      : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, itemId } = await params;
    const participantId = request.nextUrl.searchParams.get('participantId');
    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'participantId is required' },
        { status: 400 }
      );
    }

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const isHost = await isParticipantHost(participantId, group.id);
    await removeDraftItem(itemId, participantId, isHost);

    return NextResponse.json({ success: true, message: 'Item removed' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to remove item';
    const status = msg.includes('owner') || msg.includes('host') ? 403
      : msg.includes('locked') ? 403
      : msg.includes('not found') ? 404
      : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
