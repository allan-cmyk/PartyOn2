'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import styles from './AnimatedHeroText.module.css';

interface AnimatedHeroTextProps {
  drinks: string[];
  destinations: string[];
  drinkIntervalMs?: number;
  transitionMs?: number;
}

export default function AnimatedHeroText({
  drinks,
  destinations,
  drinkIntervalMs = 2500,
  transitionMs = 500,
}: AnimatedHeroTextProps) {
  const prefersReduced = usePrefersReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Drink rotation
  useEffect(() => {
    if (prefersReduced || drinks.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => {
        setPrevIndex(prev);
        return (prev + 1) % drinks.length;
      });

      setTimeout(() => {
        if (mountedRef.current) {
          setIsTransitioning(false);
          setPrevIndex(null);
        }
      }, transitionMs);
    }, drinkIntervalMs);

    return () => clearInterval(interval);
  }, [prefersReduced, drinks.length, drinkIntervalMs, transitionMs]);

  const marqueeDuration = `${destinations.length * 4}s`;
  const destinationText = destinations.join(' \u2022 ');

  return (
    <h1 className="font-heading font-light text-3xl sm:text-5xl md:text-7xl tracking-[0.1em] sm:tracking-[0.08em]">
      {/* Line 1: "Get your {DRINK}" */}
      <span className="block text-white">
        <span className="text-xl sm:text-3xl md:text-5xl">Get your</span>{' '}
        <span
          className={styles.drinkSlider}
          style={{ '--drink-transition-ms': `${transitionMs}ms` } as React.CSSProperties}
        >
          {/* Sizer: renders all words invisibly to reserve max width */}
          {drinks.map((word) => (
            <span key={word} className={styles.drinkSizer} aria-hidden="true">
              {word}
            </span>
          ))}

          {/* Exit word */}
          {isTransitioning && prevIndex !== null && (
            <span className={`${styles.drinkWord} ${styles.drinkWordExit} text-brand-yellow`}>
              {drinks[prevIndex]}
            </span>
          )}

          {/* Current word */}
          <span
            className={`${styles.drinkWord} ${isTransitioning ? styles.drinkWordEnter : ''} text-brand-yellow`}
          >
            {drinks[currentIndex]}
          </span>
        </span>
      </span>

      {/* Line 2: static */}
      <span className="block text-brand-yellow">delivered cold and on time</span>

      {/* Line 3: "to your {DESTINATION}" marquee */}
      <span className="block text-white">
        <span className="text-xl sm:text-3xl md:text-5xl">to your</span>{' '}
        {prefersReduced ? (
          <span className="text-brand-yellow">{destinations[0]}</span>
        ) : (
          <span
            className={styles.marqueeContainer}
            style={{ '--marquee-duration': marqueeDuration, display: 'inline-block', maxWidth: '70%' } as React.CSSProperties}
          >
            <span className={styles.marqueeTrack}>
              <span className="text-brand-yellow">
                {destinationText} &bull;{' '}
              </span>
              <span className="text-brand-yellow" aria-hidden="true">
                {destinationText} &bull;{' '}
              </span>
            </span>
          </span>
        )}
      </span>
    </h1>
  );
}
