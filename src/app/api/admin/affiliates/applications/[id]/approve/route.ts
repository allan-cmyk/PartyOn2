/**
 * POST /api/ops/affiliates/applications/[id]/approve
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { approveApplication } from '@/lib/affiliates/affiliate-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireAdminRole();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const affiliate = await approveApplication(id);
    return NextResponse.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('[Ops Approve API] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to approve application';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
