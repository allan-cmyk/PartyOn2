'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';

interface PartnerHeroVideoProps {
  /** YouTube video ID */
  videoId: string;
  /** Fallback image URL */
  fallbackImage: string;
  /** Alt text for image */
  alt: string;
}

/**
 * YouTube video background component for partner hero sections
 * Displays a muted, autoplay, looping YouTube video with image fallback
 */
export default function PartnerHeroVideo({
  videoId,
  fallbackImage,
  alt,
}: PartnerHeroVideoProps): ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // YouTube embed URL with parameters for background video behavior
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  const handleIframeError = () => {
    setHasError(true);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* YouTube Video Background */}
      {isVisible && !hasError && (
        <div className="absolute inset-0 pointer-events-none">
          <iframe
            src={embedUrl}
            title="Background video"
            className={`absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ minWidth: '100%', minHeight: '100%' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      )}

      {/* Fallback Image */}
      <Image
        src={fallbackImage}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-700 ${
          isLoaded && !hasError ? 'opacity-0' : 'opacity-100'
        }`}
        priority
        sizes="100vw"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/70" />
    </div>
  );
}
