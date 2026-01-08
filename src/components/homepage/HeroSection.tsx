'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { trackCTAClick } from '@/lib/analytics/ga4-events';

export default function HeroSection() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const heroImages = [
    { src: '/images/hero/austin-skyline-hero.webp', alt: 'Austin Skyline' },
    { src: '/images/hero/homepage-hero-sunset.webp', alt: 'Austin sunset from Lady Bird Lake' },
    { src: '/images/hero/homepage-hero-rooftop.webp', alt: 'Rooftop bar in downtown Austin' },
    { src: '/images/hero/homepage-hero-luxury.webp', alt: 'Luxury penthouse bar setup' }
  ];

  useEffect(() => {
    // Trigger fade-in animation after mount
    setIsLoaded(true);

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero images - use CSS transitions instead of Framer Motion */}
      {heroImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0} // Only first image gets priority
            loading={index === 0 ? 'eager' : 'lazy'}
            quality={index === 0 ? 60 : 50} // Lower quality for non-priority images
            sizes="(max-width: 768px) 100vw, 100vw"
            fetchPriority={index === 0 ? 'high' : 'low'}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

      {/* Hero Dots Navigation */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeroIndex(index)}
            aria-label={`View hero image ${index + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentHeroIndex ? 'bg-gold-400 w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Hero content with CSS animation */}
      <div
        className={`relative text-center text-white z-10 max-w-4xl mx-auto px-6 sm:px-8 pt-24 pb-32 sm:pt-28 sm:pb-36 md:pt-32 md:pb-40 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="font-serif font-light text-3xl sm:text-5xl md:text-7xl mb-4 sm:mb-6 tracking-[0.1em] sm:tracking-[0.15em]">
          <span className="block text-white">Drinks, Ice, Bar Setups</span>
          <span className="block text-gold-400">Delivered on Time</span>
        </h1>
        <div className="w-16 sm:w-24 h-px bg-gold-400 mx-auto mb-4 sm:mb-6" />
        <p className="text-base sm:text-lg md:text-xl font-light tracking-[0.05em] sm:tracking-[0.1em] mb-4 sm:mb-8 text-gray-200 max-w-lg mx-auto">
          From house parties to Lake Travis weddings—everything arrives cold with ice, cups, and mixers handled.
        </p>
        <div className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-8 tracking-[0.05em]">
          Licensed • Insured • TABC-certified • 5.0★ on Google
        </div>
        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/products"
            onClick={() => trackCTAClick('ORDER NOW', '/products', 'hero')}
          >
            <button className="px-8 sm:px-10 py-3 sm:py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-all duration-300 tracking-[0.15em] text-sm">
              ORDER NOW
            </button>
          </Link>
          <Link
            href="/order"
            onClick={() => trackCTAClick('PLAN MY EVENT', '/order', 'hero')}
          >
            <button className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm">
              PLAN MY EVENT
            </button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator with CSS animation */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer transition-opacity duration-1000 delay-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => scrollToSection('experience')}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
