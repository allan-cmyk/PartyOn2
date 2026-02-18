'use client';

import { useMemo } from 'react';
import type { EventType } from '@/lib/drinkPlannerTypes';
import { getGuestValues, getQuickPickValues } from '@/lib/drinkPlannerLogic';

interface GuestCountStepProps {
  eventType: EventType | null;
  value: number;
  onChange: (count: number) => void;
  onNext: () => void;
}

export default function GuestCountStep({ eventType, value, onChange, onNext }: GuestCountStepProps) {
  const guestValues = useMemo(() => getGuestValues(eventType), [eventType]);
  const quickPicks = getQuickPickValues(eventType);

  // Find the closest index for the current value
  const currentIndex = useMemo(() => {
    let closest = 0;
    let closestDiff = Math.abs(guestValues[0] - value);
    for (let i = 1; i < guestValues.length; i++) {
      const diff = Math.abs(guestValues[i] - value);
      if (diff < closestDiff) {
        closest = i;
        closestDiff = diff;
      }
    }
    return closest;
  }, [guestValues, value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    onChange(guestValues[idx]);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        How many guests?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        We&apos;ll make sure everyone&apos;s covered
      </p>

      {/* Large number display */}
      <div className="text-center mb-8">
        <span className="text-7xl md:text-8xl font-heading font-light text-brand-yellow tracking-wide">
          {value}
        </span>
        <span className="block text-gray-400 text-sm tracking-[0.1em] mt-2 uppercase">
          guests
        </span>
      </div>

      {/* Slider */}
      <div className="px-4 mb-8">
        <input
          type="range"
          min={0}
          max={guestValues.length - 1}
          step={1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-yellow
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-brand-yellow [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{guestValues[0]}</span>
          <span>{guestValues[guestValues.length - 1]}</span>
        </div>
      </div>

      {/* Quick-pick chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {quickPicks.map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${value === num
                ? 'bg-brand-yellow text-gray-900'
                : 'bg-gray-800 text-gray-300 border border-gray-600 hover:border-gray-400'
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Next button */}
      <div className="text-center">
        <button
          onClick={onNext}
          className="bg-brand-yellow text-gray-900 font-semibold text-base px-10 py-3.5 rounded-full tracking-[0.08em] hover:bg-yellow-400 transition-colors shadow-lg"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
