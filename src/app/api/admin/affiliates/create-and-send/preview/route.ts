import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { generateAffiliateWelcomeEmail } from '@/lib/email/templates/affiliate-welcome';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { contactName, businessName, code, personalNote } = body;

    if (!contactName || !businessName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const previewCode = code || 'YOURCODE';
    const referralLink = `${BASE_URL}/partners/${previewCode.toLowerCase()}`;
    const dashboardLink = `${BASE_URL}/affiliate/login`;

    const html = generateAffiliateWelcomeEmail({
      contactName,
      businessName,
      code: previewCode,
      referralLink,
      dashboardLink,
      personalNote: personalNote || undefined,
    });

    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('[Affiliate] Preview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
