/**
 * Password Management API
 *
 * POST /api/v1/auth/password - Request password reset
 * PUT /api/v1/auth/password - Reset password with token
 * PATCH /api/v1/auth/password - Change password (logged-in users)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requestPasswordReset,
  resetPassword,
  changePassword,
  getSession,
} from '@/lib/auth';
import { sendEmail } from '@/lib/email/resend-client';
import { EmailType } from '@prisma/client';

/**
 * POST /api/v1/auth/password
 * Request password reset (forgot password)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await requestPasswordReset(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Send password reset email (non-blocking)
    if (result.resetToken) {
      const resetUrl = `https://partyondelivery.com/account/reset-password?token=${result.resetToken}`;
      sendEmail({
        to: email,
        subject: 'Reset Your PartyOn Delivery Password',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1a1a1a; padding: 32px; text-align: center;">
              <img src="https://partyondelivery.com/images/pod-logo-2025.png" alt="PartyOn Delivery" width="180" style="width: 180px; max-width: 100%; height: auto; margin-bottom: 12px;" />
              <p style="color: #ffffff; margin: 0; font-size: 14px;">PREMIUM ALCOHOL DELIVERY</p>
            </div>
            <div style="padding: 24px;">
              <h2 style="color: #1a1a1a;">Password Reset Request</h2>
              <p style="color: #666;">We received a request to reset your password. Click the button below to set a new password:</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600;">Reset Password</a>
              </div>
              <p style="color: #999; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
          </div>
        `,
        text: `Reset your PartyOn Delivery password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
        type: EmailType.PASSWORD_RESET,
      }).catch((err: unknown) => console.error('[Auth] Password reset email failed:', err));
    }
    // For security, we always return success even if email doesn't exist

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('[Auth API] Request password reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request password reset',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/auth/password
 * Reset password with token
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    const result = await resetPassword(token, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[Auth API] Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/auth/password
 * Change password (logged-in users)
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const result = await changePassword(session.customerId, currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('[Auth API] Change password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      },
      { status: 500 }
    );
  }
}
