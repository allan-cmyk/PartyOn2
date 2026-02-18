'use client';

import { useState } from 'react';
import type { DrinkingVibe } from '@/lib/drinkPlannerTypes';
import { VIBE_LABELS } from '@/lib/drinkPlannerTypes';

interface DrinkingVibeStepProps {
  selected: DrinkingVibe | null;
  onSelect: (vibe: DrinkingVibe) => void;
}

const vibes: DrinkingVibe[] = ['light', 'social', 'party'];

const VIBE_ICONS: Record<DrinkingVibe, string> = {
  light: '\u2615', // coffee cup
  social: '\u{1F37B}', // clinking beers
  party: '\u{1F525}', // fire
};

export default function DrinkingVibeStep({ selected, onSelect }: DrinkingVibeStepProps) {
  const [animating, setAnimating] = useState<DrinkingVibe | null>(null);

  const handleSelect = (vibe: DrinkingVibe) => {
    setAnimating(vibe);
    setTimeout(() => onSelect(vibe), 300);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        What&apos;s the drinking vibe?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        No judgment here
      </p>

      <div className="space-y-4">
        {vibes.map((vibe) => {
          const isSelected = animating === vibe || selected === vibe;
          const info = VIBE_LABELS[vibe];
          return (
            <button
              key={vibe}
              onClick={() => handleSelect(vibe)}
              className={`
                w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10 scale-[1.02] shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-3xl" role="img" aria-hidden="true">{VIBE_ICONS[vibe]}</span>
              <div>
                <span className={`text-lg font-medium tracking-[0.05em] block ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                  {info.label}
                </span>
                <span className="text-sm text-gray-400">{info.description}</span>
              </div>
              {isSelected && (
                <svg className="w-6 h-6 text-brand-yellow ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
