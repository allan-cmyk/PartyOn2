'use client';

import React from 'react';

interface HeroOverlayProps {
  variant?: 'classic' | 'dramatic' | 'subtle' | 'luxury';
  children?: React.ReactNode;
}

export default function HeroOverlay({ variant = 'classic', children }: HeroOverlayProps) {
  const overlays = {
    classic: (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />
        {children}
      </>
    ),
    dramatic: (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 via-transparent to-gray-900/40" />
        {/* Gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/10 via-transparent to-transparent" />
        {children}
      </>
    ),
    subtle: (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-gray-900/20 to-gray-900/40" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-gray-900/30" />
        {children}
      </>
    ),
    luxury: (
      <>
        {/* Multi-layer luxury overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/30 to-gray-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-800/20 via-transparent to-yellow-800/20" />
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent animate-shimmer" />
        </div>
        {/* Noise texture for depth */}
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light">
          <svg width="100%" height="100%">
            <filter id="noise">
              <feTurbulence baseFrequency="0.9" numOctaves="4" />
              <feColorMatrix values="0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.3 0 0 0 1 0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
        {children}
      </>
    )
  };

  return overlays[variant];
}