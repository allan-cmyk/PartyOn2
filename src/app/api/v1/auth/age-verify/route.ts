/**
 * Age Verification API
 *
 * POST /api/v1/auth/age-verify - Verify customer is 21+
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyAge } from '@/lib/auth';

/**
 * POST /api/v1/auth/age-verify
 * Verify customer is 21 or older
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dateOfBirth } = body;

    if (!dateOfBirth) {
      return NextResponse.json(
        { success: false, error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    // Parse date of birth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const result = await verifyAge(session.customerId, dob);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Age verified successfully.',
    });
  } catch (error) {
    console.error('[Auth API] Age verify error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify age',
      },
      { status: 500 }
    );
  }
}
