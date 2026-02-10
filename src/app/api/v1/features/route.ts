/**
 * Feature Flags API
 *
 * GET /api/v1/features - Get all feature flags
 * GET /api/v1/features?key=FLAG_NAME - Get specific flag
 * POST /api/v1/features - Set feature flag (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  isFeatureEnabled,
  getAllFlags,
  setFeatureFlag,
} from '@/lib/inventory/services/feature-flag-service';

/**
 * GET /api/v1/features
 * Get feature flag(s)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const key = request.nextUrl.searchParams.get('key');

    if (key) {
      // Get specific flag
      const enabled = await isFeatureEnabled(key);
      return NextResponse.json({
        success: true,
        key,
        enabled,
      });
    }

    // Get all flags
    const flags = await getAllFlags();
    return NextResponse.json({
      success: true,
      flags,
    });
  } catch (error) {
    console.error('[Features API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get feature flags',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/features
 * Set feature flag (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin authorization
    const adminKey = process.env.ADMIN_API_KEY;
    const authHeader = request.headers.get('authorization');

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, enabled, rolloutPercentage } = body;

    if (!key || enabled === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: key, enabled' },
        { status: 400 }
      );
    }

    await setFeatureFlag(key, enabled, rolloutPercentage);

    return NextResponse.json({
      success: true,
      message: `Feature flag '${key}' set to ${enabled}`,
    });
  } catch (error) {
    console.error('[Features API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set feature flag',
      },
      { status: 500 }
    );
  }
}
