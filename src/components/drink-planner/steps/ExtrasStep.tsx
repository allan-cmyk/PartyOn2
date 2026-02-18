'use client';

import type { Extra } from '@/lib/drinkPlannerTypes';

interface ExtrasStepProps {
  selected: Extra[];
  onToggle: (extra: Extra) => void;
  onNext: () => void;
}

const EXTRAS: { id: Extra; label: string; description: string }[] = [
  { id: 'na-water', label: 'NA / Water Options', description: 'Topo Chico, Liquid Death' },
  { id: 'no-glass', label: 'No Glass (boat-friendly)', description: 'Cans and plastic only' },
  { id: 'ice-cups', label: 'Ice & Cups', description: 'We bring the essentials' },
];

export default function ExtrasStep({ selected, onToggle, onNext }: ExtrasStepProps) {
  return (
    <div className="max-w-xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        Any extras?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        All optional &mdash; skip if you&apos;re good
      </p>

      <div className="space-y-3 mb-10">
        {EXTRAS.map((extra) => {
          const isSelected = selected.includes(extra.id);
          return (
            <button
              key={extra.id}
              onClick={() => onToggle(extra.id)}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }
              `}
            >
              <div className="text-left">
                <span className={`text-sm font-medium block ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                  {extra.label}
                </span>
                <span className="text-xs text-gray-400">{extra.description}</span>
              </div>
              <div className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-colors
                ${isSelected ? 'bg-brand-yellow border-brand-yellow' : 'border-gray-600'}
              `}>
                {isSelected && (
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

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
