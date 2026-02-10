/**
 * Logout API
 *
 * POST /api/v1/auth/logout - End customer session
 */

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/**
 * POST /api/v1/auth/logout
 * Clear session and log out customer
 */
export async function POST(): Promise<NextResponse> {
  try {
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Auth API] Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      },
      { status: 500 }
    );
  }
}
