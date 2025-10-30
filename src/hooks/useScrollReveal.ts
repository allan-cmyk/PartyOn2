import { useEffect, useRef } from 'react';

/**
 * Hook to trigger scroll-reveal-css animation when element enters viewport.
 * Replaces Framer Motion's whileInView functionality.
 *
 * @param options - Intersection observer options
 * @returns ref to attach to element
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-css');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      ...options,
    });

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return ref;
}
