'use client';

import React from 'react';
import Image from 'next/image';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

interface LuxuryCardProps {
  children: React.ReactNode;
  featured?: boolean;
  index?: number;
  backgroundImage?: string;
  className?: string;
}

const backgroundImages = [
  '/images/textures/gold-liquid-abstract.webp',
  '/images/textures/crystal-ice-texture.webp',
  '/images/textures/whiskey-amber-swirl.webp',
  '/images/textures/marble-gold-veins.webp',
  '/images/textures/champagne-bubbles-bokeh.webp',
  '/images/textures/vintage-leather-luxury.webp',
  '/images/textures/premium-wood-grain.webp',
  '/images/textures/silk-fabric-gold.webp',
  '/images/gallery/sunset-champagne-pontoon.webp',
  '/images/textures/brushed-metal-gold.webp',
];

const fallbackImages = [
  '/images/products/premium-spirits-wall.webp',
  '/images/gallery/sunset-champagne-pontoon.webp',
  '/images/services/boat-parties/luxury-yacht-deck.webp',
];

export default function LuxuryCard({ 
  children, 
  featured = false, 
  index = 0, 
  backgroundImage,
  className = ''
}: LuxuryCardProps) {
  // Select background image
  const bgImage = backgroundImage || backgroundImages[index % backgroundImages.length];
  const fallbackImage = fallbackImages[index % fallbackImages.length];

  return (
    <ScrollRevealCSS
      duration={800}
      delay={index * 100}
      y={20}
    >
      <div
        className={`relative bg-white overflow-hidden group ${
          featured ? 'ring-2 ring-brand-yellow shadow-xl' : 'border border-gray-200 hover:shadow-lg'
        } transition-all duration-500 hover:-translate-y-1 ${className}`}
      >
      {/* Primary texture background */}
      <div className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700">
        <Image
          src={bgImage}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover scale-150 group-hover:scale-125 transition-transform duration-1500"
          aria-hidden="true"
          onError={(e) => {
            // Fallback to existing images if texture doesn't exist yet
            e.currentTarget.src = fallbackImage;
          }}
        />
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/96 via-white/94 to-white/96" />
        
        {/* Gold shimmer for featured cards */}
        {featured && (
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/5 via-transparent to-brand-yellow/5" />
        )}
        
        {/* Hover effect gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-yellow/0 via-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Light reflection effect */}
      <div className="absolute -inset-40 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Premium corner accent for featured */}
      {featured && (
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className="absolute transform rotate-45 bg-brand-yellow text-gray-900 text-xs font-light tracking-wider py-1 right-[-25px] top-[15px] w-[100px] text-center">
            PREMIUM
          </div>
        </div>
      )}
      </div>
    </ScrollRevealCSS>
  );
}