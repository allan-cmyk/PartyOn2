'use client';

import { useState } from 'react';
import type { Duration, EventType } from '@/lib/drinkPlannerTypes';
import { DURATION_LABELS } from '@/lib/drinkPlannerTypes';

interface DurationStepProps {
  eventType: EventType | null;
  selected: Duration | null;
  onSelect: (duration: Duration) => void;
}

export default function DurationStep({ eventType, selected, onSelect }: DurationStepProps) {
  const [animating, setAnimating] = useState<Duration | null>(null);

  const durations: Duration[] = ['2-3', '4-5', '6-8', 'all-day'];
  if (eventType === 'weekend-trip') {
    durations.push('2-days', '3-days');
  }

  const handleSelect = (d: Duration) => {
    setAnimating(d);
    setTimeout(() => onSelect(d), 300);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        How long is the party?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        Helps us calculate the right amount
      </p>

      <div className="grid grid-cols-2 gap-3">
        {durations.map((d) => {
          const isSelected = animating === d || selected === d;
          return (
            <button
              key={d}
              onClick={() => handleSelect(d)}
              className={`
                p-5 rounded-2xl border-2 transition-all duration-200 text-center
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10 scale-[1.03] shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              <span className={`text-base font-medium tracking-[0.05em] ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                {DURATION_LABELS[d]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
