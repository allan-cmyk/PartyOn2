/**
 * GET /api/admin/affiliates/applications -- list partner applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { listApplications } from '@/lib/affiliates/affiliate-service';
import { ApplicationStatus } from '@prisma/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const statusParam = request.nextUrl.searchParams.get('status') as ApplicationStatus | null;
    const applications = await listApplications(statusParam || undefined);
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('[Ops Applications API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list applications' }, { status: 500 });
  }
}
