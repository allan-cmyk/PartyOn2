/**
 * POST /api/admin/affiliates/[id]/send-welcome
 * Resend the welcome email to an existing affiliate
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/database/client';
import { sendEmail } from '@/lib/email/resend-client';
import { generateAffiliateWelcomeEmail, generateAffiliateWelcomeText } from '@/lib/email/templates/affiliate-welcome';
import { EmailType } from '@prisma/client';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireAdminRole();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const affiliate = await prisma.affiliate.findUnique({ where: { id } });
    if (!affiliate) {
      return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
    }

    const referralLink = `${BASE_URL}/partners/${affiliate.code.toLowerCase()}`;
    const directReferralLink = `${BASE_URL}/partners/${affiliate.code.toLowerCase()}?ref=${affiliate.code}`;
    const dashboardLink = `${BASE_URL}/affiliate/login`;

    const html = generateAffiliateWelcomeEmail({
      contactName: affiliate.contactName,
      businessName: affiliate.businessName,
      code: affiliate.code,
      referralLink,
      directReferralLink,
      dashboardLink,
    });

    const text = generateAffiliateWelcomeText({
      contactName: affiliate.contactName,
      businessName: affiliate.businessName,
      code: affiliate.code,
      referralLink,
      directReferralLink,
      dashboardLink,
    });

    const resendId = await sendEmail({
      to: affiliate.email,
      subject: 'Welcome to the Party On Delivery Partner Program!',
      html,
      text,
      type: EmailType.AFFILIATE_WELCOME,
    });

    if (!resendId) {
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('[Affiliate Send Welcome] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
