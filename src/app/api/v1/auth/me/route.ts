/**
 * Current User API
 *
 * GET /api/v1/auth/me - Get current authenticated customer
 * PATCH /api/v1/auth/me - Update customer profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCustomerById, updateCustomerProfile } from '@/lib/auth';

/**
 * GET /api/v1/auth/me
 * Get current authenticated customer
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const customer = await getCustomerById(session.customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error('[Auth API] Get me error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/auth/me
 * Update customer profile
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
    const { firstName, lastName, phone, acceptsMarketing } = body;

    const customer = await updateCustomerProfile(session.customerId, {
      firstName,
      lastName,
      phone,
      acceptsMarketing,
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error('[Auth API] Update me error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
