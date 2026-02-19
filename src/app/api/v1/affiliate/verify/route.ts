/**
 * GET /api/v1/affiliate/verify?token=XXX
 * Validate magic link token and create session
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { setAffiliateSessionCookie } from '@/lib/affiliates/affiliate-session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    // Find the token
    const magicLink = await prisma.magicLinkToken.findUnique({
      where: { token },
      include: { affiliate: true },
    });

    if (!magicLink) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 400 });
    }

    // Check expiry
    if (magicLink.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired. Please request a new one.' }, { status: 400 });
    }

    // Check if already used
    if (magicLink.usedAt) {
      return NextResponse.json({ success: false, error: 'Link has already been used. Please request a new one.' }, { status: 400 });
    }

    // Check affiliate is active
    if (magicLink.affiliate.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Your affiliate account is not active.' }, { status: 403 });
    }

    // Mark token as used
    await prisma.magicLinkToken.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    // Set session cookie
    await setAffiliateSessionCookie({
      affiliateId: magicLink.affiliate.id,
      email: magicLink.affiliate.email,
      code: magicLink.affiliate.code,
    });

    return NextResponse.json({ success: true, redirect: '/affiliate/dashboard' });
  } catch (error) {
    console.error('[Affiliate Verify API] Error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
