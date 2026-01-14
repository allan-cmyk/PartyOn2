/**
 * Feature Flags API
 * GET /api/v1/admin/features - List all feature flags
 * PATCH /api/v1/admin/features - Update a feature flag
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllFeatureFlags,
  enableFeature,
  disableFeature,
  setRolloutPercentage,
  FEATURE_FLAGS,
  type FeatureFlagKey,
} from '@/lib/features/feature-flags';

/**
 * GET /api/v1/admin/features
 * List all feature flags and their status
 */
export async function GET(): Promise<NextResponse> {
  try {
    const flags = await getAllFeatureFlags();

    // Get all available flag keys
    const allKeys = Object.values(FEATURE_FLAGS);

    // Combine existing flags with missing ones (default to disabled)
    const existingKeys = new Set(flags.map((f) => f.key));
    const combinedFlags = [
      ...flags,
      ...allKeys
        .filter((key) => !existingKeys.has(key))
        .map((key) => ({
          key,
          enabled: false,
          rolloutPercentage: 0,
        })),
    ].sort((a, b) => a.key.localeCompare(b.key));

    return NextResponse.json({
      success: true,
      data: combinedFlags,
    });
  } catch (error) {
    console.error('[Features API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch features',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/features
 * Update a feature flag
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { key, enabled, rolloutPercentage } = body as {
      key: FeatureFlagKey;
      enabled?: boolean;
      rolloutPercentage?: number;
    };

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Feature key is required' },
        { status: 400 }
      );
    }

    // Validate key is a known feature flag
    const validKeys = Object.values(FEATURE_FLAGS);
    if (!validKeys.includes(key)) {
      return NextResponse.json(
        { success: false, error: 'Invalid feature key' },
        { status: 400 }
      );
    }

    if (rolloutPercentage !== undefined) {
      await setRolloutPercentage(key, rolloutPercentage);
    } else if (enabled === true) {
      await enableFeature(key);
    } else if (enabled === false) {
      await disableFeature(key);
    } else {
      return NextResponse.json(
        { success: false, error: 'Must provide enabled or rolloutPercentage' },
        { status: 400 }
      );
    }

    // Get updated flags
    const flags = await getAllFeatureFlags();
    const updatedFlag = flags.find((f) => f.key === key);

    return NextResponse.json({
      success: true,
      data: updatedFlag,
    });
  } catch (error) {
    console.error('[Features API] Update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update feature',
      },
      { status: 500 }
    );
  }
}
