/**
 * POST /api/v2/group-orders/[code]/join - Join a group order
 */

import { NextRequest, NextResponse } from 'next/server';
import { JoinGroupOrderSchema } from '@/lib/group-orders-v2/validation';
import { joinGroupOrder } from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();
    const parsed = JoinGroupOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const participant = await joinGroupOrder(code, parsed.data);

    return NextResponse.json(
      { success: true, data: participant },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to join';
    const status = msg.includes('not found') ? 404
      : msg.includes('not accepting') ? 403
      : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
