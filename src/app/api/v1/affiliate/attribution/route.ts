/**
 * GET /api/v1/affiliate/attribution
 * Check if the current visitor has an active affiliate attribution cookie.
 * Also accepts ?code=REF_CODE query param as fallback when cookie not set.
 * Used by the checkout page to show "Free delivery" banner.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAffiliateByCode } from '@/lib/affiliates/affiliate-service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const refCode = cookieStore.get('ref_code')?.value;
    const queryCode = request.nextUrl.searchParams.get('code');

    const code = refCode || queryCode;

    if (!code) {
      return NextResponse.json({ success: true, data: { active: false } });
    }

    const affiliate = await getAffiliateByCode(code);

    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return NextResponse.json({ success: true, data: { active: false } });
    }

    return NextResponse.json({
      success: true,
      data: {
        active: true,
        affiliateId: affiliate.id,
        partnerName: affiliate.businessName,
        customerPerk: affiliate.customerPerk,
      },
    });
  } catch (error) {
    console.error('[Attribution API] Error:', error);
    return NextResponse.json({ success: true, data: { active: false } });
  }
}
