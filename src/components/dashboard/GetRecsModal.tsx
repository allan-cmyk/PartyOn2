'use client';

import { useState, useMemo, type ReactElement } from 'react';
import type { DrinkCategory } from '@/lib/drinkPlannerTypes';
import { getGuestValues } from '@/lib/drinkPlannerLogic';

interface Props {
  shareCode: string;
  onRecommendations: (recs: RecommendationResult[]) => void;
  onClose: () => void;
}

export interface RecommendationResult {
  name: string;
  searchQuery: string;
  quantity: number;
  unit: string;
  category: string;
  matchedProduct?: {
    id: string;
    variantId: string;
    title: string;
    price: number;
    imageUrl: string | null;
  };
}

const DURATION_OPTIONS = [
  { value: '2h', label: '2h' },
  { value: '3h', label: '3h' },
  { value: '4h', label: '4h' },
  { value: '5h', label: '5h' },
  { value: '6h', label: '6h' },
  { value: 'multi-day', label: 'All Day' },
];

const DRINK_TYPES: { value: DrinkCategory; label: string }[] = [
  { value: 'beer', label: 'Beer' },
  { value: 'seltzers', label: 'Seltzers' },
  { value: 'cocktail-kits', label: 'Cocktails' },
  { value: 'wine', label: 'Wine' },
  { value: 'spirits', label: 'Spirits' },
];

export default function GetRecsModal({
  shareCode,
  onRecommendations,
  onClose,
}: Props): ReactElement {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const guestValues = useMemo(() => getGuestValues(null), []);
  const defaultIdx = guestValues.indexOf(20);
  const [sliderIdx, setSliderIdx] = useState(defaultIdx >= 0 ? defaultIdx : 15);
  const guestCount = guestValues[sliderIdx] ?? 20;
  const [duration, setDuration] = useState('4h');
  const [drinkTypes, setDrinkTypes] = useState<DrinkCategory[]>(['beer', 'seltzers']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleDrinkType(type: DrinkCategory) {
    setDrinkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleGetRecs() {
    if (!guestCount || guestCount < 1) {
      setError('Please select a guest count');
      return;
    }
    const guests = guestCount;
    if (drinkTypes.length === 0) {
      setError('Please select at least one drink type');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        guests: String(guests),
        duration,
        drinkTypes: drinkTypes.join(','),
      });
      const res = await fetch(
        `/api/v2/group-orders/${shareCode}/recommendations?${params}`
      );
      if (!res.ok) throw new Error('Failed to get recommendations');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      onRecommendations(json.data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-1">
          Get Recommendations
        </h2>
        <p className="text-xs text-gray-400 text-center mb-4">
          Step {step} of 3
        </p>

        {step === 1 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              How many guests?
            </p>
            <div className="text-center mb-4">
              <span className="text-5xl font-bold text-gray-900">{guestCount}</span>
              <span className="text-sm text-gray-500 ml-1">guests</span>
            </div>
            <input
              type="range"
              min={0}
              max={guestValues.length - 1}
              value={sliderIdx}
              onChange={(e) => setSliderIdx(Number(e.target.value))}
              className="w-full accent-brand-yellow"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 mb-4">
              <span>{guestValues[0]}</span>
              <span>{guestValues[guestValues.length - 1]}</span>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-brand-blue text-white font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              How long is the event?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    duration === opt.value
                      ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold tracking-[0.08em] rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-brand-blue text-white font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              What do your guests drink?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DRINK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleDrinkType(type.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                    drinkTypes.includes(type.value)
                      ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold tracking-[0.08em] rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGetRecs}
                disabled={loading}
                className="flex-1 py-3 bg-brand-yellow text-gray-900 font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Get My Recs'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
