/**
 * PATCH /api/v2/group-orders/[code]/participants/[pid] - Update participant (e.g. add email)
 * DELETE /api/v2/group-orders/[code]/participants/[pid] - Remove participant (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getGroupOrderByCode,
  removeParticipant,
  isParticipantHost,
} from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string; pid: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { code, pid } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
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

    // Verify the participant exists and belongs to this group
    const participant = group.participants.find((p) => p.id === pid);
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if another participant already has this email in this group
    const existingWithEmail = await prisma.groupParticipantV2.findUnique({
      where: {
        groupOrderId_guestEmail: {
          groupOrderId: group.id,
          guestEmail: email,
        },
      },
    });
    if (existingWithEmail && existingWithEmail.id !== pid) {
      return NextResponse.json(
        { success: false, error: 'This email is already associated with another participant' },
        { status: 409 }
      );
    }

    await prisma.groupParticipantV2.update({
      where: { id: pid },
      data: { guestEmail: email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Group V2] Update participant error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update participant' },
      { status: 500 }
    );
  }
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
