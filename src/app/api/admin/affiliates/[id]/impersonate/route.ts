/**
 * POST /api/admin/affiliates/[id]/impersonate
 * Sets the affiliate_session cookie so the admin can use the real affiliate portal.
 * Also sets a non-httpOnly admin_impersonating cookie so the UI can show a banner.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { setAffiliateSessionCookie } from '@/lib/affiliates/affiliate-session';
import { cookies } from 'next/headers';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdminRole();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    select: { id: true, email: true, code: true, businessName: true },
  });

  if (!affiliate) {
    return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
  }

  // Set the real affiliate session cookie
  await setAffiliateSessionCookie({
    affiliateId: affiliate.id,
    email: affiliate.email,
    code: affiliate.code,
  });

  // Set a readable cookie so the frontend can show the impersonation banner
  const cookieStore = await cookies();
  cookieStore.set('admin_impersonating', affiliate.businessName, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 4, // 4 hours
    path: '/',
  });

  return NextResponse.json({ success: true, redirectTo: '/affiliate/dashboard' });
}
