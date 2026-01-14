/**
 * Login API
 *
 * POST /api/v1/auth/login - Authenticate customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer, setSessionCookie } from '@/lib/auth';

/**
 * POST /api/v1/auth/login
 * Authenticate customer with email and password
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await loginCustomer(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // Set session cookie
    if (result.customer) {
      await setSessionCookie(result.customer);
    }

    return NextResponse.json({
      success: true,
      data: {
        customer: result.customer,
        requiresVerification: result.requiresVerification,
      },
    });
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 }
    );
  }
}
