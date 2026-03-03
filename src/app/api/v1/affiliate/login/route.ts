/**
 * POST /api/v1/affiliate/login
 * Password-based login for affiliates
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { verifyPassword } from '@/lib/auth/auth-service';
import { setAffiliateSessionCookie } from '@/lib/affiliates/affiliate-session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (affiliate.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Your affiliate account is not active.' },
        { status: 403 }
      );
    }

    if (!affiliate.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'NO_PASSWORD_SET' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, affiliate.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await setAffiliateSessionCookie({
      affiliateId: affiliate.id,
      email: affiliate.email,
      code: affiliate.code,
    });

    return NextResponse.json({ success: true, redirect: '/affiliate/dashboard' });
  } catch (error) {
    console.error('[Affiliate Login API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
