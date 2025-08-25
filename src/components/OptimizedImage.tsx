'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.01,
        rootMargin: '100px', // Start loading 100px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate blur placeholder for Shopify images
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    
    // For Shopify images, use their image transformation API for a tiny blur
    if (src.includes('cdn.shopify.com')) {
      const url = new URL(src);
      url.searchParams.set('width', '10');
      url.searchParams.set('quality', '10');
      return url.toString();
    }
    
    return undefined;
  };

  const handleLoad = () => {
    setHasLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  // Show fallback for error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef} 
      className={`relative ${className}`}
      style={fill ? undefined : { width, height }}
    >
      {/* Loading skeleton */}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Actual image */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          className={`${className} ${hasLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          sizes={sizes || (fill ? '100vw' : undefined)}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={getBlurDataURL()}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}