'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { trackCTAClick, trackHeroVariant } from '@/lib/analytics/ga4-events';
import { HeroVariantContent, heroControl } from '@/lib/experiments/hero-variants';
import AnimatedHeroText from '@/components/hero/AnimatedHeroText';

interface HeroSectionProps {
  variant?: HeroVariantContent;
  experimentId?: string;
}

const heroFadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const trustChips = [
  { icon: 'check', label: 'Licensed & insured' },
  { icon: 'star', label: '5-star reviews' },
  { icon: 'check', label: 'On-time delivery' },
  { icon: 'check', label: 'Optional setup' },
  { icon: 'check', label: 'Split-pay group ordering' },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function StarIcon() {
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function HeroSection({ variant, experimentId }: HeroSectionProps) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const content = variant || heroControl;
  const variantId = content.id;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % content.images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [content.images.length]);

  useEffect(() => {
    if (experimentId && variantId && !hasTrackedImpression) {
      trackHeroVariant(experimentId, variantId, 'hero');
      fetch('/api/experiments/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'impression',
          experimentId,
          variantId,
        }),
      }).catch(console.error);
      setHasTrackedImpression(true);
    }
  }, [experimentId, variantId, hasTrackedImpression]);

  const handleCTAClick = (buttonText: string, buttonUrl: string) => {
    trackCTAClick(buttonText, buttonUrl, 'hero', experimentId, variantId);
    if (experimentId) {
      fetch('/api/experiments/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'click',
          experimentId,
          variantId,
          metadata: { buttonText },
        }),
      }).catch(console.error);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background images — carousel preserved from main */}
      {content.images.map((image, index) => (
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
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            quality={index === 0 ? 60 : 50}
            sizes="(max-width: 768px) 100vw, 100vw"
            fetchPriority={index === 0 ? 'high' : 'low'}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

      {/* Hero Dots Navigation */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {content.images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeroIndex(index)}
            aria-label={`View hero image ${index + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentHeroIndex ? 'bg-brand-yellow w-8' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-6 sm:px-8 pt-24 pb-32 sm:pt-28 sm:pb-36 md:pt-32 md:pb-40">
        {/* Animated Headline */}
        <motion.div
          {...heroFadeUp}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-4 md:mb-5"
        >
          <AnimatedHeroText
            drinks={["Beer", "Cocktails", "Seltzers", "Wine", "Champagne"]}
            destinations={["boat party", "wedding", "corporate event", "house party", "Airbnb", "Austin venue"]}
            drinkIntervalMs={4800}
            transitionMs={800}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          {...heroFadeUp}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-sans text-lg md:text-xl text-white/80 mb-6 md:mb-8 max-w-lg mx-auto"
        >
          {content.tagline}
        </motion.p>

        {/* Trust Chips */}
        <motion.div
          {...heroFadeUp}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-8"
        >
          {trustChips.map((chip) => (
            <span
              key={chip.label}
              className="bg-white/10 backdrop-blur text-white text-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5"
            >
              {chip.icon === 'star' ? <StarIcon /> : <CheckIcon />}
              {chip.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          {...heroFadeUp}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center flex-wrap"
        >
          {content.ctaButtons.map((cta, index) => {
            if (cta.style === 'text-link') {
              return (
                <Link
                  key={`${cta.text}-${index}`}
                  href={cta.url}
                  onClick={() => handleCTAClick(cta.text, cta.url)}
                  className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-1 mt-1"
                >
                  {cta.text}
                </Link>
              );
            }
            return (
              <Link
                key={`${cta.text}-${index}`}
                href={cta.url}
                onClick={() => handleCTAClick(cta.text, cta.url)}
                className={`px-8 sm:px-10 py-3 sm:py-4 rounded-lg transition-all duration-300 tracking-[0.08em] text-sm font-semibold text-center ${
                  cta.style === 'primary'
                    ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-600'
                    : 'border-2 border-white/40 text-white hover:bg-white/10'
                }`}
              >
                {cta.text}
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={() => {
          if (typeof window !== 'undefined') {
            document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
