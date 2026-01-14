/**
 * Verification API
 *
 * POST /api/v1/auth/verify - Verify email with token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth';

/**
 * POST /api/v1/auth/verify
 * Verify email with token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('[Auth API] Verify email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify email',
      },
      { status: 500 }
    );
  }
}
