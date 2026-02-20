/**
 * POST /api/v2/group-orders/dashboard
 * Create a new dashboard order (simplified flow for universal ordering)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDashboardOrder } from '@/lib/group-orders-v2/service';
import { CreateDashboardSchema } from '@/lib/group-orders-v2/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const group = await createDashboardOrder(parsed.data);

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    console.error('[Dashboard] Create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dashboard order' },
      { status: 500 }
    );
  }
}
