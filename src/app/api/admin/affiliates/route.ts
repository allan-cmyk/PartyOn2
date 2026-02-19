/**
 * GET /api/admin/affiliates -- list affiliates
 * PUT /api/admin/affiliates/[id] handled by dynamic route
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { listAffiliates } from '@/lib/affiliates/affiliate-service';
import { AffiliateStatus } from '@prisma/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const statusParam = request.nextUrl.searchParams.get('status') as AffiliateStatus | null;
    const affiliates = await listAffiliates(statusParam || undefined);
    return NextResponse.json({ success: true, data: affiliates });
  } catch (error) {
    console.error('[Ops Affiliates API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list affiliates' }, { status: 500 });
  }
}
