/**
 * POST /api/admin/affiliates/applications/[id]/approve
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { approveApplication, getPartnerSlug } from '@/lib/affiliates/affiliate-service';
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
    const affiliate = await approveApplication(id);

    // Send welcome email (don't block approval if email fails)
    let emailSent = false;
    try {
      const slug = getPartnerSlug(affiliate);
      const referralLink = `${BASE_URL}/partners/${slug}`;
      const directReferralLink = `${BASE_URL}/partners/${slug}?ref=${affiliate.code}`;
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
      emailSent = resendId !== null;
    } catch (emailError) {
      console.error('[Ops Approve API] Welcome email failed:', emailError);
    }

    return NextResponse.json({ success: true, data: { affiliate, emailSent } });
  } catch (error) {
    console.error('[Ops Approve API] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to approve application';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
