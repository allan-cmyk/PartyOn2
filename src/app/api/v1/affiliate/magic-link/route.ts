/**
 * POST /api/v1/affiliate/magic-link
 * Send a magic link email to an affiliate for dashboard login
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAffiliateByEmail } from '@/lib/affiliates/affiliate-service';
import crypto from 'crypto';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const affiliate = await getAffiliateByEmail(email);

    // Always return success to prevent email enumeration
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      console.log('[Magic Link] No active affiliate found for:', email);
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.magicLinkToken.create({
      data: {
        affiliateId: affiliate.id,
        token,
        expiresAt,
      },
    });

    // Send email via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const verifyUrl = `${appUrl}/affiliate/verify?token=${token}`;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Party On <noreply@partyondelivery.com>',
        to: affiliate.email,
        subject: 'Your Party On Partner Dashboard Login Link',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Partner Dashboard Login</h2>
            <p>Hi ${affiliate.contactName},</p>
            <p>Click the link below to access your Party On partner dashboard:</p>
            <p style="margin: 24px 0;">
              <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Open Dashboard
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This link expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">Party On Delivery - Austin, TX</p>
          </div>
        `,
      });

      // Log the email
      await prisma.emailLog.create({
        data: {
          type: 'AFFILIATE_MAGIC_LINK',
          to: affiliate.email,
          subject: 'Your Party On Partner Dashboard Login Link',
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log('[Magic Link] Sent to:', affiliate.email);
    } catch (emailError) {
      console.error('[Magic Link] Failed to send email:', emailError);
      // Affiliate was found, so this is a real send failure -- tell the client
      return NextResponse.json(
        { success: false, error: 'Failed to send login email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Magic Link API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send magic link' }, { status: 500 });
  }
}
