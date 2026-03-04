import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { createAffiliate, getAffiliateByEmail, getPartnerSlug } from '@/lib/affiliates/affiliate-service';
import { sendEmail } from '@/lib/email/resend-client';
import { generateAffiliateWelcomeEmail, generateAffiliateWelcomeText } from '@/lib/email/templates/affiliate-welcome';
import { AffiliateCategory, EmailType } from '@prisma/client';

const VALID_CATEGORIES: AffiliateCategory[] = ['BARTENDER', 'BOAT', 'VENUE', 'PLANNER', 'OTHER'];
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminRole();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { contactName, businessName, email, phone, category, code, personalNote, partnerSlug } = body;

    // Validate required fields
    if (!contactName || !businessName || !email || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: contactName, businessName, email, category' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for existing affiliate with same email
    const existing = await getAffiliateByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An affiliate with this email already exists' },
        { status: 409 }
      );
    }

    // Create affiliate
    const affiliate = await createAffiliate({
      contactName,
      businessName,
      email,
      phone: phone || undefined,
      category,
      code: code || undefined,
      partnerSlug: partnerSlug || undefined,
    });

    // Send welcome email
    const slug = getPartnerSlug(affiliate);
    const referralLink = `${BASE_URL}/partners/${slug}`;
    const directReferralLink = `${BASE_URL}/partners/${slug}?ref=${affiliate.code}`;
    const dashboardLink = `${BASE_URL}/affiliate/login`;

    const html = generateAffiliateWelcomeEmail({
      contactName,
      businessName,
      code: affiliate.code,
      referralLink,
      directReferralLink,
      dashboardLink,
      personalNote: personalNote || undefined,
    });

    const text = generateAffiliateWelcomeText({
      contactName,
      businessName,
      code: affiliate.code,
      referralLink,
      directReferralLink,
      dashboardLink,
      personalNote: personalNote || undefined,
    });

    let emailSent = false;
    try {
      const resendId = await sendEmail({
        to: email,
        subject: 'Welcome to the Party On Delivery Partner Program!',
        html,
        text,
        type: EmailType.AFFILIATE_WELCOME,
      });
      emailSent = resendId !== null;
    } catch (emailError) {
      console.error('[Affiliate] Welcome email failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: { affiliate, emailSent },
    });
  } catch (error) {
    console.error('[Affiliate] Create and send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create affiliate' },
      { status: 500 }
    );
  }
}
