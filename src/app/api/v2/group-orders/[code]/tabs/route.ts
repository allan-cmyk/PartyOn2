/**
 * POST /api/v2/group-orders/[code]/tabs - Create a new tab (host only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateTabSchema } from '@/lib/group-orders-v2/validation';
import {
  getGroupOrderByCode,
  createTab,
  isParticipantHost,
} from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
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
      return NextResponse.json(
        { success: false, error: 'Group order not found' },
        { status: 404 }
      );
    }

    const isHost = await isParticipantHost(hostParticipantId, group.id);
    if (!isHost) {
      return NextResponse.json(
        { success: false, error: 'Only the host can create tabs' },
        { status: 403 }
      );
    }

    const parsed = CreateTabSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tab = await createTab(group.id, parsed.data);

    return NextResponse.json(
      { success: true, data: tab },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Group V2] Create tab error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tab' },
      { status: 500 }
    );
  }
}
