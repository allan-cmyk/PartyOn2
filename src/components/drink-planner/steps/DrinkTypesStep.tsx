'use client';

import type { DrinkCategory } from '@/lib/drinkPlannerTypes';
import { DRINK_CATEGORY_LABELS } from '@/lib/drinkPlannerTypes';

interface DrinkTypesStepProps {
  selected: DrinkCategory[];
  onToggle: (category: DrinkCategory) => void;
  onQuickSelect: () => void;
  onNext: () => void;
}

const categories: DrinkCategory[] = ['beer', 'seltzers', 'wine', 'champagne', 'cocktail-kits', 'spirits'];

const CATEGORY_ICONS: Record<DrinkCategory, string> = {
  'beer': '\u{1F37A}',
  'seltzers': '\u{1F964}',
  'wine': '\u{1F377}',
  'champagne': '\u{1F942}',
  'cocktail-kits': '\u{1F378}',
  'spirits': '\u{1F943}',
};

export default function DrinkTypesStep({ selected, onToggle, onQuickSelect, onNext }: DrinkTypesStepProps) {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        What are we drinking?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-6">
        Select all that apply
      </p>

      {/* Quick option */}
      <div className="text-center mb-8">
        <button
          onClick={onQuickSelect}
          className={`
            inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all border
            ${selected.includes('beer') && selected.includes('seltzers') && selected.length === 2
              ? 'bg-brand-yellow/20 border-brand-yellow text-brand-yellow'
              : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400'
            }
          `}
        >
          Keep it simple &mdash; Beer + Seltzers
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`
                relative flex flex-col items-center justify-center
                p-5 rounded-2xl border-2 transition-all duration-200
                min-h-[100px]
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10 shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-2xl mb-2" role="img" aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
              <span className={`text-sm font-medium tracking-[0.05em] ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                {DRINK_CATEGORY_LABELS[cat]}
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

      <div className="text-center">
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className={`
            font-semibold text-base px-10 py-3.5 rounded-full tracking-[0.08em] transition-colors shadow-lg
            ${selected.length > 0
              ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-400'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          NEXT
        </button>
        {selected.length === 0 && (
          <p className="text-gray-500 text-xs mt-3 tracking-[0.05em]">Select at least one to continue</p>
        )}
      </div>
    </div>
  );
}
