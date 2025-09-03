'use client';

import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768) {
  // Initialize with undefined to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  // Return false during SSR and initial render
  return isMobile ?? false;
}

// Hook for touch device detection
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is needed for older IE/Edge compatibility
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouchDevice;
}