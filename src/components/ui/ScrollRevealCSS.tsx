'use client';

import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface ScrollRevealCSSProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  y?: number;
  /**
   * Once: only animate the first time (true = once, false = every time)
   * Default: true (same as Framer Motion whileInView with viewport.once)
   */
  once?: boolean;
}

/**
 * CSS-based scroll reveal component using Intersection Observer
 * Drop-in replacement for the Framer Motion ScrollReveal component
 *
 * Features:
 * - Zero JavaScript for animation execution (CSS-only)
 * - Respects prefers-reduced-motion
 * - Configurable delay, duration, and distance
 * - Same API as original for easy migration
 * - ~1KB vs ~50KB for Framer Motion version
 *
 * @example
 * ```tsx
 * <ScrollRevealCSS delay={100} duration={800}>
 *   <h1>Animated Title</h1>
 * </ScrollRevealCSS>
 * ```
 */
export default function ScrollRevealCSS({
  children,
  delay = 0,
  duration = 800,
  className = '',
  y = 30,
  once = true,
}: ScrollRevealCSSProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, show immediately without animation
    if (prefersReducedMotion) {
      element.classList.add('scroll-reveal-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('scroll-reveal-visible');

            // If once=true, stop observing after first trigger
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // If once=false, remove class when out of view (for repeated animations)
            element.classList.remove('scroll-reveal-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px', // Trigger slightly before element enters viewport
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  const animationStyle: CSSProperties = {
    '--scroll-reveal-delay': `${delay}ms`,
    '--scroll-reveal-duration': `${duration}ms`,
    '--scroll-reveal-distance': `${y}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
}
