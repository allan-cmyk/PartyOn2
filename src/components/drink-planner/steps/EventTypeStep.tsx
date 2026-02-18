'use client';

import { useState } from 'react';
import type { EventType } from '@/lib/drinkPlannerTypes';
import { EVENT_TYPE_LABELS } from '@/lib/drinkPlannerTypes';

const EVENT_ICONS: Record<EventType, string> = {
  'bachelor': '🎯',
  'bachelorette': '💅',
  'house-party': '🏠',
  'corporate': '💼',
  'wedding': '💒',
  'boat-day': '⛵',
  'weekend-trip': '🏕️',
  'other': '🎉',
};

// Using text labels instead of emojis for a cleaner look
const EVENT_DISPLAY: Record<EventType, string> = {
  'bachelor': 'Bachelor',
  'bachelorette': 'Bachelorette',
  'house-party': 'House Party',
  'corporate': 'Corporate',
  'wedding': 'Wedding',
  'boat-day': 'Boat Day',
  'weekend-trip': 'Weekend Trip',
  'other': 'Other',
};

interface EventTypeStepProps {
  selected: EventType | null;
  onSelect: (type: EventType) => void;
}

const eventTypes: EventType[] = [
  'bachelor', 'bachelorette', 'house-party', 'corporate',
  'wedding', 'boat-day', 'weekend-trip', 'other',
];

export default function EventTypeStep({ selected, onSelect }: EventTypeStepProps) {
  const [animating, setAnimating] = useState<EventType | null>(null);

  const handleSelect = (type: EventType) => {
    setAnimating(type);
    setTimeout(() => {
      onSelect(type);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        What kind of event?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        This helps us tailor your drink recommendations
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {eventTypes.map((type) => {
          const isSelected = animating === type || selected === type;
          return (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className={`
                relative flex flex-col items-center justify-center
                p-5 md:p-6 rounded-2xl border-2 transition-all duration-200
                min-h-[100px] md:min-h-[120px]
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10 scale-[1.03] shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-2xl mb-2" role="img" aria-label={EVENT_TYPE_LABELS[type]}>
                {EVENT_ICONS[type]}
              </span>
              <span className={`text-sm font-medium tracking-[0.08em] ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                {EVENT_DISPLAY[type]}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
