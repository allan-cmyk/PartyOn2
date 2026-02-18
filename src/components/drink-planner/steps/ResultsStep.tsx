'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QuizState, QuizResults, ProductRecommendation } from '@/lib/drinkPlannerTypes';
import { calculateQuizResults } from '@/lib/drinkPlannerLogic';
import QuoteModal from '../QuoteModal';

interface ResultsStepProps {
  state: QuizState;
  onAddAllToCart: (recommendations: ProductRecommendation[]) => void;
  onReset: () => void;
  onSetPackageTier: (tier: 'standard' | 'premium') => void;
}

export default function ResultsStep({ state, onAddAllToCart, onReset, onSetPackageTier }: ResultsStepProps) {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showCalcDetails, setShowCalcDetails] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const r = calculateQuizResults(state);
    setResults(r);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [state]);

  const handleAddAll = useCallback(async () => {
    if (!results || addingToCart) return;
    setAddingToCart(true);
    try {
      await onAddAllToCart(results.recommendations);
    } finally {
      setAddingToCart(false);
    }
  }, [results, addingToCart, onAddAllToCart]);

  if (!results) return null;

  const totalItems = results.recommendations.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 relative">
      {/* CSS Confetti */}
      {showConfetti && <ConfettiAnimation />}

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-2">
          Your Party Plan is Ready!
        </h2>
        <p className="text-gray-400 text-sm tracking-[0.05em]">
          {results.summary.eventType} &middot; {results.summary.guestCount} guests &middot; {results.summary.duration}
        </p>
      </div>

      {/* Package Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-800 rounded-full p-1 border border-gray-700">
          <button
            onClick={() => onSetPackageTier('standard')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all tracking-[0.05em] ${
              state.packageTier === 'standard'
                ? 'bg-brand-yellow text-gray-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onSetPackageTier('premium')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all tracking-[0.05em] ${
              state.packageTier === 'premium'
                ? 'bg-brand-yellow text-gray-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3 mb-4">
        {results.recommendations.map((rec, i) => (
          <div
            key={`${rec.searchQuery}-${i}`}
            className="flex items-center justify-between p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl"
          >
            <div>
              <span className="text-white text-sm font-medium">{rec.name}</span>
              <span className="text-gray-400 text-xs ml-2 capitalize">{rec.category}</span>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <span className="text-brand-yellow font-semibold text-sm">
                {rec.quantity} {rec.unit}{rec.quantity > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total row */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-600 rounded-xl mb-8">
        <span className="text-white font-medium text-sm tracking-[0.05em]">
          Total: {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
        <span className="text-brand-yellow font-semibold text-base tracking-[0.03em]">
          Est. ${results.estimatedCost.toFixed(2)}
        </span>
      </div>

      {/* Bartender note */}
      {state.bartender === 'yes' && (
        <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-4 mb-6 text-center">
          <p className="text-brand-yellow text-sm">
            Bartender requested &mdash; we&apos;ll follow up with pricing
          </p>
        </div>
      )}

      {/* How we calculated */}
      <div className="mb-8">
        <button
          onClick={() => setShowCalcDetails(!showCalcDetails)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm tracking-[0.05em] transition-colors mx-auto"
        >
          <span>How we calculated this</span>
          <svg
            className={`w-4 h-4 transition-transform ${showCalcDetails ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showCalcDetails && (
          <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-xl p-5 text-sm text-gray-300 space-y-2">
            <p>Based on your {results.summary.guestCount} guests at a {results.summary.vibe.toLowerCase()} drinking pace for {results.summary.duration.toLowerCase()}:</p>
            <p>Estimated total drinks: <span className="text-brand-yellow font-medium">{results.totalDrinks}</span></p>
            <p>We factor in drink type variety, event duration, and a small buffer so you never run out.</p>
            {state.packageTier === 'premium' && (
              <p>Premium tier adds ~25% extra for a more generous bar.</p>
            )}
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleAddAll}
          disabled={addingToCart}
          className="bg-brand-yellow text-gray-900 font-semibold text-base px-10 py-3.5 rounded-full tracking-[0.08em] hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-50 w-full max-w-sm"
        >
          {addingToCart ? 'Adding...' : 'ADD ALL TO CART'}
        </button>
        <p className="text-gray-500 text-xs tracking-[0.05em]">
          You can edit this once it&apos;s in your cart
        </p>
        <button
          onClick={() => setShowQuoteModal(true)}
          className="border-2 border-gray-600 text-gray-200 font-medium text-sm px-8 py-3 rounded-full tracking-[0.08em] hover:border-gray-400 transition-colors w-full max-w-sm"
        >
          SEND ME THIS QUOTE
        </button>
        <button
          onClick={onReset}
          className="text-gray-500 hover:text-gray-300 text-sm tracking-[0.08em] underline underline-offset-4 decoration-gray-600 transition-colors mt-2"
        >
          Start Over
        </button>
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <QuoteModal results={results} onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  );
}

function ConfettiAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-2 h-3 rounded-sm"
            style={{
              backgroundColor: ['#F5A623', '#E8D44D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 6],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
}
