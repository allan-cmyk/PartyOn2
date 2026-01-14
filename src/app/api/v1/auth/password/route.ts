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

    // TODO: Send password reset email with result.resetToken
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
