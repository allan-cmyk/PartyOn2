/**
 * Experiment Service
 * Core logic for A/B testing variant assignment and tracking
 */

import { prisma } from '@/lib/prisma';

// Cookie name for visitor ID (30-day persistence)
export const VISITOR_ID_COOKIE = 'partyonVisitorId';
export const VISITOR_ID_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Cookie name for experiment assignments
export const EXPERIMENT_COOKIE_PREFIX = 'exp_';

/**
 * Generate a deterministic hash from a string
 * Used for consistent variant assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Assign a variant to a user based on experiment weights
 * Uses deterministic hashing for consistent assignment
 */
export function assignVariantByWeight(
  visitorId: string,
  experimentId: string,
  variants: Array<{ id: string; weight: number }>
): string {
  // Create deterministic hash from visitorId + experimentId
  const hashInput = `${visitorId}-${experimentId}`;
  const hash = hashString(hashInput);
  const bucket = hash % 100; // 0-99

  // Find variant based on cumulative weights
  let cumulativeWeight = 0;
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (bucket < cumulativeWeight) {
      return variant.id;
    }
  }

  // Fallback to first variant (shouldn't happen if weights sum to 100)
  return variants[0]?.id || '';
}

/**
 * Get active experiments for a specific page
 */
export async function getActiveExperimentsForPage(page: string) {
  try {
    const experiments = await prisma.experiment.findMany({
      where: {
        page,
        status: 'RUNNING',
      },
      include: {
        variants: {
          orderBy: { isControl: 'desc' },
        },
      },
    });

    return experiments;
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return [];
  }
}

/**
 * Get active experiment for a specific page and element
 */
export async function getActiveExperiment(page: string, elementId: string) {
  try {
    const experiment = await prisma.experiment.findFirst({
      where: {
        page,
        elementId,
        status: 'RUNNING',
      },
      include: {
        variants: {
          orderBy: { isControl: 'desc' },
        },
      },
    });

    return experiment;
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return null;
  }
}

/**
 * Record an impression for a variant
 */
export async function recordImpression(variantId: string) {
  try {
    await prisma.experimentVariant.update({
      where: { id: variantId },
      data: {
        impressions: { increment: 1 },
      },
    });
    return true;
  } catch (error) {
    console.error('Error recording impression:', error);
    return false;
  }
}

/**
 * Record a click for a variant
 */
export async function recordClick(variantId: string) {
  try {
    await prisma.experimentVariant.update({
      where: { id: variantId },
      data: {
        clicks: { increment: 1 },
      },
    });
    return true;
  } catch (error) {
    console.error('Error recording click:', error);
    return false;
  }
}

/**
 * Record a conversion for a variant
 */
export async function recordConversion(variantId: string, revenue?: number) {
  try {
    await prisma.experimentVariant.update({
      where: { id: variantId },
      data: {
        conversions: { increment: 1 },
        ...(revenue !== undefined && { revenue: { increment: revenue } }),
      },
    });
    return true;
  } catch (error) {
    console.error('Error recording conversion:', error);
    return false;
  }
}

/**
 * Get experiment by ID with variants
 */
export async function getExperimentById(experimentId: string) {
  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        variants: {
          orderBy: { isControl: 'desc' },
        },
      },
    });

    return experiment;
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return null;
  }
}

/**
 * Generate a new visitor ID (UUID v4)
 */
export function generateVisitorId(): string {
  return crypto.randomUUID();
}
