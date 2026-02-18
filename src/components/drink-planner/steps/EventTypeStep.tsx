'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { EventType } from '@/lib/drinkPlannerTypes';
import { EVENT_TYPE_LABELS } from '@/lib/drinkPlannerTypes';

const EVENT_IMAGES: Record<EventType, string> = {
  'bachelor': '/images/services/bach-parties/bachelor-party-epic.webp',
  'bachelorette': '/images/services/bach-parties/bachelorette-champagne-tower.webp',
  'house-party': '/images/hero/hero-house-pool.webp',
  'corporate': '/images/hero/corporate-hero-conference.webp',
  'wedding': '/images/services/weddings/outdoor-bar-setup.webp',
  'boat-day': '/images/services/boat-parties/luxury-yacht-deck.webp',
  'weekend-trip': '/images/destinations/hill-country-winery.webp',
  'other': '/images/hero/hero-drink-skyline.webp',
};

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
                relative flex items-end justify-center overflow-hidden
                rounded-2xl border-2 transition-all duration-200
                min-h-[120px] md:min-h-[140px]
                ${isSelected
                  ? 'border-brand-yellow scale-[1.03] shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 hover:border-gray-500'
                }
              `}
            >
              <Image
                src={EVENT_IMAGES[type]}
                alt={EVENT_TYPE_LABELS[type]}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/40" />
              <span className={`relative z-10 text-sm font-semibold tracking-[0.08em] pb-4 ${isSelected ? 'text-brand-yellow' : 'text-white'}`}>
                {EVENT_DISPLAY[type]}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
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
