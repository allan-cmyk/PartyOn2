'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedHeroTextProps {
  drinks: string[];
  destinations: string[];
  drinkIntervalMs?: number;
  transitionMs?: number;
}

export default function AnimatedHeroText({
  drinks,
  destinations,
  drinkIntervalMs = 4800,
  transitionMs = 800,
}: AnimatedHeroTextProps) {
  const [drinkIndex, setDrinkIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(0);

  const rotateDrink = useCallback(() => {
    setDrinkIndex((prev) => (prev + 1) % drinks.length);
  }, [drinks.length]);

  const rotateDest = useCallback(() => {
    setDestIndex((prev) => (prev + 1) % destinations.length);
  }, [destinations.length]);

  useEffect(() => {
    const interval = setInterval(rotateDrink, drinkIntervalMs);
    return () => clearInterval(interval);
  }, [rotateDrink, drinkIntervalMs]);

  useEffect(() => {
    const interval = setInterval(rotateDest, drinkIntervalMs + 200);
    return () => clearInterval(interval);
  }, [rotateDest, drinkIntervalMs]);

  // Find the longest word for the ghost sizer
  const longestDrink = drinks.reduce((a, b) => (a.length >= b.length ? a : b), '');
  const longestDest = destinations.reduce((a, b) => (a.length >= b.length ? a : b), '');

  const ease = [0.25, 0.1, 0.25, 1] as const;

  return (
    <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-[0.02em] text-center leading-[1.15]">
      {/* Line 1: "{DRINK}" rotating word */}
      <span className="block"><span className="inline-block relative align-baseline">
        {/* Ghost text — invisible, holds width of longest word */}
        <span className="invisible" aria-hidden="true">{longestDrink}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={drinks[drinkIndex]}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: transitionMs / 1000, ease }}
            className="absolute inset-0 text-brand-yellow"
          >
            {drinks[drinkIndex]}
          </motion.span>
        </AnimatePresence>
      </span></span>

      {/* Line 2: "delivered cold" */}
      <span className="block text-white">delivered cold</span>

      {/* Line 3: "& on time to your" */}
      <span className="block text-white">&amp; on time to your</span>

      {/* Line 4: "{DESTINATION}" rotating word */}
      <span className="block"><span className="inline-block relative align-baseline">
        {/* Ghost text for destination width */}
        <span className="invisible" aria-hidden="true">{longestDest}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={destinations[destIndex]}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: transitionMs / 1000, ease }}
            className="absolute inset-0 text-brand-yellow"
          >
            {destinations[destIndex]}
          </motion.span>
        </AnimatePresence>
      </span></span>
    </h1>
  );
}
