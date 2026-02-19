/**
 * GET /api/v1/affiliate/attribution
 * Check if the current visitor has an active affiliate attribution cookie.
 * Used by the checkout page to show "Free delivery" banner.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAffiliateByCode } from '@/lib/affiliates/affiliate-service';

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const refCode = cookieStore.get('ref_code')?.value;

    if (!refCode) {
      return NextResponse.json({ success: true, data: { active: false } });
    }

    const affiliate = await getAffiliateByCode(refCode);

    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return NextResponse.json({ success: true, data: { active: false } });
    }

    return NextResponse.json({
      success: true,
      data: {
        active: true,
        partnerName: affiliate.businessName,
      },
    });
  } catch (error) {
    console.error('[Attribution API] Error:', error);
    return NextResponse.json({ success: true, data: { active: false } });
  }
}
