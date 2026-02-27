/**
 * GET /api/v1/affiliate/dev-login?code=TESTBARBEC2
 * Dev-only: instantly log in as an affiliate (no magic link needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { createAffiliateSessionToken } from '@/lib/affiliates/affiliate-session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Block on production domain, allow on Vercel preview + local dev
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'code query param required' }, { status: 400 });
  }

  const affiliate = await prisma.affiliate.findFirst({
    where: { code, status: 'ACTIVE' },
  });

  if (!affiliate) {
    return NextResponse.json({ error: `No active affiliate with code: ${code}` }, { status: 404 });
  }

  const token = await createAffiliateSessionToken({
    affiliateId: affiliate.id,
    email: affiliate.email,
    code: affiliate.code,
  });

  const response = NextResponse.redirect(new URL('/affiliate/dashboard', request.url));
  response.cookies.set('affiliate_session', token, {
    httpOnly: true,
    secure: request.url.startsWith('https'),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
