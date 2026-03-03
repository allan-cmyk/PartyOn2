/**
 * POST /api/v1/affiliate/set-password
 * Set or update password for logged-in affiliate
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { hashPassword } from '@/lib/auth/auth-service';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.affiliate.update({
      where: { id: session.affiliateId },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Affiliate Set Password API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set password' },
      { status: 500 }
    );
  }
}
