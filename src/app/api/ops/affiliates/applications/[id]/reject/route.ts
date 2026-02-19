/**
 * POST /api/ops/affiliates/applications/[id]/reject
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectApplication } from '@/lib/affiliates/affiliate-service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const application = await rejectApplication(id);
    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('[Ops Reject API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reject application' }, { status: 500 });
  }
}
