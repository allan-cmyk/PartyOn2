/**
 * Homepage analytics tracking wrapper
 * Enables scroll depth tracking for the homepage
 * @module components/analytics/HomepageTracking
 */

'use client';

import type { ReactElement } from 'react';
import { useScrollTracking } from '@/hooks/useScrollTracking';

/**
 * Invisible component that enables scroll tracking on the homepage
 */
export default function HomepageTracking(): ReactElement {
  useScrollTracking();
  return <></>;
}
