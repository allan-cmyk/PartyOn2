'use client';

import { useEffect, useRef, type ReactElement } from 'react';

interface LazyVideoProps {
  src: string;
  className?: string;
  /** IntersectionObserver threshold (0-1). Defaults to 0.25 — start when 25% visible. */
  threshold?: number;
}

/**
 * Video that starts playing only when scrolled into view, then pauses when
 * scrolled away. Avoids paying the autoplay cost (decode + bandwidth) for
 * videos far below the fold.
 */
export default function LazyVideo({
  src,
  className,
  threshold = 0.25,
}: LazyVideoProps): ReactElement {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.play().catch(() => {
              // Autoplay can fail in some browsers; silently ignore
            });
          } else {
            el.pause();
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <video
      ref={ref}
      loop
      muted
      playsInline
      preload="metadata"
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
