/**
 * GET /api/v1/affiliate/attribution
 * Check if the current visitor has an active affiliate attribution cookie.
 * Also accepts ?code=REF_CODE query param as fallback when cookie not set.
 * Used by the checkout page to show "Free delivery" banner.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolveAffiliateByRef } from '@/lib/affiliates/affiliate-service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const refCode = cookieStore.get('ref_code')?.value;
    const queryCode = request.nextUrl.searchParams.get('code');

    // Explicit beats inferred WHEN IT RESOLVES: an explicit ?code= (from
    // /order?ref= or the partner-page StrStartOrderButton) expresses fresher
    // intent than a 30-day cookie, so it wins. On a miss we fall back to the
    // cookie — this matters for API callers passing a stale/placeholder
    // ?code= while a valid cookie exists. (A document navigation with a
    // WELL-FORMED junk ?ref= will have already overwritten the cookie in
    // middleware before this runs — that clobber can't be detected without a
    // DB at the edge; malformed refs are no longer written at all.) Both
    // forms — Affiliate.code and the cookie's UPPERCASED SLUG variant
    // ("FIVE-STAR" for code "FIVESTAR") — resolve via resolveAffiliateByRef;
    // a code-only lookup silently dropped slug-form attribution until
    // 2026-09 (and cookie-first shadowed valid explicit codes before the
    // 2026-07-08 review — keep this order).
    let affiliate = queryCode ? await resolveAffiliateByRef(queryCode) : null;
    if ((!affiliate || affiliate.status !== 'ACTIVE') && refCode && refCode !== queryCode) {
      affiliate = await resolveAffiliateByRef(refCode);
    }

    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return NextResponse.json({ success: true, data: { active: false } });
    }

    return NextResponse.json({
      success: true,
      data: {
        active: true,
        affiliateId: affiliate.id,
        affiliateCode: affiliate.code,
        partnerName: affiliate.businessName,
        customerPerk: affiliate.customerPerk,
      },
    });
  } catch (error) {
    console.error('[Attribution API] Error:', error);
    return NextResponse.json({ success: true, data: { active: false } });
  }
}
