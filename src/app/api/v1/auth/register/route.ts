/**
 * Registration API
 *
 * POST /api/v1/auth/register - Register a new customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer, setSessionCookie } from '@/lib/auth';

/**
 * POST /api/v1/auth/register
 * Register a new customer
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, acceptsMarketing } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Register customer
    const result = await registerCustomer({
      email,
      password,
      firstName,
      lastName,
      phone,
      acceptsMarketing,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Set session cookie (auto-login after registration)
    if (result.customer) {
      await setSessionCookie(result.customer);
    }

    // TODO: Send verification email with result.verificationToken

    return NextResponse.json({
      success: true,
      data: {
        customer: result.customer,
        message: 'Registration successful. Please check your email to verify your account.',
      },
    });
  } catch (error) {
    console.error('[Auth API] Register error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 500 }
    );
  }
}
