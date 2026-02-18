'use client';

import { useState } from 'react';
import type { BartenderChoice } from '@/lib/drinkPlannerTypes';

interface BartenderStepProps {
  selected: BartenderChoice | null;
  onSelect: (choice: BartenderChoice) => void;
}

export default function BartenderStep({ selected, onSelect }: BartenderStepProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [animating, setAnimating] = useState<string | null>(null);

  const handleSelect = (choice: BartenderChoice) => {
    if (choice === 'tell-me-more') {
      setShowInfo(true);
      return;
    }
    setAnimating(choice);
    setTimeout(() => onSelect(choice), 300);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        Need a bartender?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        We can staff your event with a professional bartender
      </p>

      {showInfo && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 mb-8">
          <h3 className="text-brand-yellow font-medium text-sm tracking-[0.08em] mb-3 uppercase">
            Bartender Service
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-brand-yellow mt-0.5">-</span>
              Professional, licensed bartenders
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-yellow mt-0.5">-</span>
              Setup and cleanup included
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-yellow mt-0.5">-</span>
              Custom cocktail menu for your event
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-yellow mt-0.5">-</span>
              Pricing varies by event size and duration
            </li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            Select &quot;Yes&quot; and we&apos;ll follow up with pricing details.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {(['yes', 'no'] as const).map((choice) => {
          const isSelected = animating === choice || selected === choice;
          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              className={`
                w-full p-5 rounded-2xl border-2 transition-all duration-200 text-center
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10 scale-[1.02] shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              <span className={`text-lg font-medium tracking-[0.05em] ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                {choice === 'yes' ? 'Yes, I want a bartender' : 'No, we\'re good'}
              </span>
            </button>
          );
        })}

        {!showInfo && (
          <button
            onClick={() => handleSelect('tell-me-more')}
            className="w-full p-4 text-center text-gray-400 hover:text-gray-200 text-sm tracking-[0.08em] underline underline-offset-4 decoration-gray-600 transition-colors"
          >
            Tell me more about bartender service
          </button>
        )}
      </div>
    </div>
  );
}
