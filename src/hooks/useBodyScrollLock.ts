import { useEffect, useRef } from 'react';

/**
 * Hook to lock body scroll when component is mounted (e.g., modals, drawers)
 * Prevents scroll chaining and iOS rubber-band effects
 *
 * @param isLocked - Whether scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean = true) {
  const scrollPosition = useRef<number>(0);

  useEffect(() => {
    if (!isLocked) return;

    // Store current scroll position
    scrollPosition.current = window.scrollY;

    // Get original body overflow to restore later
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // Lock scroll - works on all mobile browsers
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition.current}px`;
    document.body.style.width = '100%';

    // Cleanup function to restore scroll
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;

      // Restore scroll position
      window.scrollTo(0, scrollPosition.current);
    };
  }, [isLocked]);
}
