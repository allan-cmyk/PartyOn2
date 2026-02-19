/**
 * GET /api/ops/affiliates/[id] -- single affiliate detail
 * PUT /api/ops/affiliates/[id] -- update affiliate
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { getAffiliateById, updateAffiliate, updateAffiliateCode, updateAffiliateStatus } from '@/lib/affiliates/affiliate-service';
import { AffiliateStatus } from '@prisma/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const affiliate = await getAffiliateById(id);
    if (!affiliate) {
      return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('[Ops Affiliate Detail API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get affiliate' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();

    // Handle code change separately
    if (body.code) {
      await updateAffiliateCode(id, body.code);
    }

    // Handle status change
    if (body.status && ['ACTIVE', 'PAUSED', 'INACTIVE'].includes(body.status)) {
      await updateAffiliateStatus(id, body.status as AffiliateStatus);
    }

    // Handle other field updates
    const updateData: Record<string, unknown> = {};
    if (body.contactName) updateData.contactName = body.contactName;
    if (body.businessName) updateData.businessName = body.businessName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.commissionRateOverride !== undefined) updateData.commissionRateOverride = body.commissionRateOverride;
    if (body.categoryRateOverride !== undefined) updateData.categoryRateOverride = body.categoryRateOverride;
    if (body.payoutMethod !== undefined) updateData.payoutMethod = body.payoutMethod;
    if (body.payoutDetails !== undefined) updateData.payoutDetails = body.payoutDetails;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;

    if (Object.keys(updateData).length > 0) {
      await updateAffiliate(id, updateData);
    }

    const updated = await getAffiliateById(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Ops Affiliate Update API] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update affiliate';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
