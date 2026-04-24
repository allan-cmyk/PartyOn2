'use client';

import { useEffect, type ReactElement } from 'react';
import { captureFirstTouch } from '@/lib/analytics/attribution';

/**
 * Runs once per browser on initial page load. Captures landing page + UTMs
 * to localStorage so checkout can forward them to Stripe session metadata.
 */
export default function AttributionTracker(): ReactElement | null {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}
