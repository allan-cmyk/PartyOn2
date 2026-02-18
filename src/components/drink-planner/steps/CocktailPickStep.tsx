'use client';

import { COCKTAIL_OPTIONS } from '@/lib/drinkPlannerLogic';

interface CocktailPickStepProps {
  selected: string[];
  onToggle: (id: string) => void;
  onSkip: () => void;
  onNext: () => void;
}

export default function CocktailPickStep({ selected, onToggle, onSkip, onNext }: CocktailPickStepProps) {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        Pick your cocktails
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        Select as many as you like, or let us choose
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {COCKTAIL_OPTIONS.map((kit) => {
          const isSelected = selected.includes(kit.id);
          return (
            <button
              key={kit.id}
              onClick={() => onToggle(kit.id)}
              className={`
                flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow/10 shadow-lg shadow-brand-yellow/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xl" role="img" aria-hidden="true">{'\u{1F378}'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium tracking-[0.03em] block ${isSelected ? 'text-brand-yellow' : 'text-gray-200'}`}>
                  {kit.name}
                </span>
                <span className="text-xs text-gray-400">{kit.description}</span>
              </div>
              {isSelected && (
                <svg className="w-5 h-5 text-brand-yellow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onNext}
          className="bg-brand-yellow text-gray-900 font-semibold text-base px-10 py-3.5 rounded-full tracking-[0.08em] hover:bg-yellow-400 transition-colors shadow-lg"
        >
          {selected.length > 0 ? 'NEXT' : 'NEXT'}
        </button>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-200 text-sm tracking-[0.08em] underline underline-offset-4 decoration-gray-600 transition-colors"
        >
          Skip &mdash; surprise me
        </button>
      </div>
    </div>
  );
}
