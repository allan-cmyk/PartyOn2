/**
 * useExperimentVariant Hook
 * Handles variant assignment and tracking for A/B tests
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  VISITOR_ID_COOKIE,
  VISITOR_ID_MAX_AGE,
  EXPERIMENT_COOKIE_PREFIX,
  generateVisitorId,
} from '@/lib/experiments/experiment-service';
import { HeroVariantContent, getHeroVariantById } from '@/lib/experiments/hero-variants';

interface ExperimentData {
  experimentId: string;
  experimentName: string;
  variantId: string;
  variantName: string;
}

interface UseExperimentVariantResult {
  variant: HeroVariantContent | null;
  experimentId: string | null;
  variantId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set a cookie with specified options
 */
function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Get or create visitor ID
 */
function getOrCreateVisitorId(): string {
  let visitorId = getCookie(VISITOR_ID_COOKIE);

  if (!visitorId) {
    visitorId = generateVisitorId();
    setCookie(VISITOR_ID_COOKIE, visitorId, VISITOR_ID_MAX_AGE);
  }

  return visitorId;
}

/**
 * Get cached experiment assignment from cookie
 */
function getCachedAssignment(experimentId: string): string | null {
  const cookieName = `${EXPERIMENT_COOKIE_PREFIX}${experimentId}`;
  return getCookie(cookieName);
}

/**
 * Cache experiment assignment in cookie
 */
function cacheAssignment(experimentId: string, variantId: string): void {
  const cookieName = `${EXPERIMENT_COOKIE_PREFIX}${experimentId}`;
  // Cache for 30 days (same as visitor ID)
  setCookie(cookieName, variantId, VISITOR_ID_MAX_AGE);
}

/**
 * Hook to get the assigned variant for an experiment
 *
 * @param page - The page path (e.g., "/")
 * @param elementId - The element being tested (e.g., "hero")
 * @returns The assigned variant content and metadata
 *
 * @example
 * ```tsx
 * const { variant, experimentId, isLoading } = useExperimentVariant('/', 'hero');
 * ```
 */
export function useExperimentVariant(
  page: string,
  elementId: string
): UseExperimentVariantResult {
  const [variant, setVariant] = useState<HeroVariantContent | null>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndAssignVariant = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get visitor ID (creates one if doesn't exist)
      const visitorId = getOrCreateVisitorId();

      // Fetch active experiment for this page/element
      const response = await fetch(
        `/api/experiments/assign?page=${encodeURIComponent(page)}&elementId=${encodeURIComponent(elementId)}&visitorId=${visitorId}`
      );

      if (!response.ok) {
        // No active experiment - use control
        setVariant(null);
        setExperimentId(null);
        setVariantId(null);
        setIsLoading(false);
        return;
      }

      const data: ExperimentData = await response.json();

      // Check if we have a cached assignment
      const cachedVariantId = getCachedAssignment(data.experimentId);

      if (cachedVariantId && cachedVariantId !== data.variantId) {
        // Use cached variant to maintain consistency
        const cachedVariant = getHeroVariantById(cachedVariantId);
        setVariant(cachedVariant);
        setExperimentId(data.experimentId);
        setVariantId(cachedVariantId);
      } else {
        // Use newly assigned variant
        const variantContent = getHeroVariantById(data.variantId);
        setVariant(variantContent);
        setExperimentId(data.experimentId);
        setVariantId(data.variantId);

        // Cache the assignment
        cacheAssignment(data.experimentId, data.variantId);
      }
    } catch (err) {
      console.error('Error fetching experiment:', err);
      setError(err instanceof Error ? err.message : 'Failed to load experiment');
      // Fall back to no variant (will use default control)
      setVariant(null);
      setExperimentId(null);
      setVariantId(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, elementId]);

  useEffect(() => {
    fetchAndAssignVariant();
  }, [fetchAndAssignVariant]);

  return {
    variant,
    experimentId,
    variantId,
    isLoading,
    error,
  };
}

/**
 * Hook to track an impression for an experiment
 */
export function useTrackImpression(
  experimentId: string | null,
  variantId: string | null
): void {
  useEffect(() => {
    if (!experimentId || !variantId) return;

    // Track impression via API
    fetch('/api/experiments/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'impression',
        experimentId,
        variantId,
      }),
    }).catch(console.error);
  }, [experimentId, variantId]);
}

/**
 * Function to track a click event for an experiment
 */
export async function trackExperimentClick(
  experimentId: string,
  variantId: string,
  buttonText?: string
): Promise<void> {
  try {
    await fetch('/api/experiments/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'click',
        experimentId,
        variantId,
        metadata: { buttonText },
      }),
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}
