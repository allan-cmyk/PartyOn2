/**
 * Hook for tracking scroll depth milestones
 * @module hooks/useScrollTracking
 */

'use client';

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/analytics/ga4-events';

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 * Only fires each milestone once per page load
 */
export function useScrollTracking(): void {
  const trackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const percentage = Math.round((scrolled / documentHeight) * 100);

      const milestones: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];

      for (const milestone of milestones) {
        if (percentage >= milestone && !trackedRef.current.has(milestone)) {
          trackedRef.current.add(milestone);
          trackScrollDepth(milestone);
        }
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);
}
