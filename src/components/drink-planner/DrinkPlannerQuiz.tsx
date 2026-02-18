'use client';

import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import type { QuizState, ProductRecommendation, DrinkCategory, Extra, StepId } from '@/lib/drinkPlannerTypes';
import {
  quizReducer,
  initialQuizState,
  getSteps,
  getStepIndex,
} from '@/lib/drinkPlannerLogic';
import QuizProgressBar from './QuizProgressBar';
import QuizStep from './QuizStep';
import PlanSummary from './PlanSummary';
import WelcomeStep from './steps/WelcomeStep';
import EventTypeStep from './steps/EventTypeStep';
import GuestCountStep from './steps/GuestCountStep';
import DrinkingVibeStep from './steps/DrinkingVibeStep';
import DurationStep from './steps/DurationStep';
import DrinkTypesStep from './steps/DrinkTypesStep';
import CocktailPickStep from './steps/CocktailPickStep';
import ExtrasStep from './steps/ExtrasStep';
import BartenderStep from './steps/BartenderStep';
import EventDetailsStep from './steps/EventDetailsStep';
import ResultsStep from './steps/ResultsStep';

const STORAGE_KEY = 'partyOn_drinkPlannerQuiz';

function loadState(): QuizState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveState(state: QuizState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

interface DrinkPlannerQuizProps {
  onSkip: () => void;
}

export default function DrinkPlannerQuiz({ onSkip }: DrinkPlannerQuizProps) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState, (init) => {
    const saved = loadState();
    return saved && !saved.completed ? saved : init;
  });
  const [direction, setDirection] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { addToCart, openCart } = useCartContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  // Scroll to top on step change
  useEffect(() => {
    if (state.currentStep !== 'welcome') {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.currentStep]);

  const goNext = useCallback(() => {
    setDirection(1);
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const handleSkip = useCallback(() => {
    dispatch({ type: 'SKIP_QUIZ' });
    localStorage.removeItem(STORAGE_KEY);
    onSkip();
  }, [onSkip]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleAddAllToCart = useCallback(async (recommendations: ProductRecommendation[]) => {
    for (const rec of recommendations) {
      try {
        const res = await fetch(`/api/v1/products/search?q=${encodeURIComponent(rec.searchQuery)}`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          const product = data.data[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const variant = product.variants?.[0] as any;
          if (variant?.shopifyId) {
            await addToCart(variant.shopifyId, rec.quantity);
          }
        }
      } catch {
        // Skip products that fail to find
      }
    }
    openCart();
    dispatch({ type: 'RESET' });
    localStorage.removeItem(STORAGE_KEY);
  }, [addToCart, openCart]);

  // If skipped, show collapsed banner
  if (state.skipped) {
    return (
      <div className="bg-gray-900 py-4 px-6 flex items-center justify-between">
        <span className="text-gray-300 text-sm tracking-[0.05em]">
          Get a personalized drink plan
        </span>
        <button
          onClick={handleReset}
          className="bg-brand-yellow text-gray-900 font-semibold text-xs px-5 py-2 rounded-full tracking-[0.08em] hover:bg-yellow-400 transition-colors"
        >
          START QUIZ
        </button>
      </div>
    );
  }

  const steps = getSteps(state);
  const stepIndex = getStepIndex(state);
  const showProgress = state.currentStep !== 'welcome' && state.currentStep !== 'results';
  const showBack = state.currentStep !== 'welcome';
  // Exclude welcome and results from progress count
  const progressSteps = steps.filter((s): s is StepId => s !== 'welcome' && s !== 'results');
  const progressIndex = progressSteps.indexOf(state.currentStep);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="relative">
      {state.currentStep === 'welcome' ? (
        <WelcomeStep onStart={goNext} onSkip={handleSkip} />
      ) : (
        <section className="relative min-h-[80vh] md:min-h-[70vh] bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/* Top bar: back + progress */}
            <div className="flex items-center gap-4 mb-8">
              {showBack && (
                <button
                  onClick={goBack}
                  className="text-gray-400 hover:text-white transition-colors p-2 -ml-2"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {showProgress && (
                <div className="flex-1 max-w-md">
                  <QuizProgressBar
                    current={progressIndex + 1}
                    total={progressSteps.length}
                  />
                </div>
              )}
            </div>

            {/* Content area with optional sidebar */}
            <div className="flex gap-8">
              {/* Main quiz content */}
              <div className="flex-1">
                <AnimatePresence mode="wait" custom={direction}>
                  <QuizStep key={state.currentStep} direction={direction}>
                    {renderStep()}
                  </QuizStep>
                </AnimatePresence>
              </div>

              {/* Desktop sidebar */}
              {state.currentStep !== 'results' && (
                <div className="hidden lg:block w-72 flex-shrink-0">
                  <PlanSummary state={state} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );

  function renderStep() {
    switch (state.currentStep) {
      case 'event-type':
        return (
          <EventTypeStep
            selected={state.eventType}
            onSelect={(type) => {
              dispatch({ type: 'SET_EVENT_TYPE', payload: type });
              setDirection(1);
              setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 350);
            }}
          />
        );
      case 'guest-count':
        return (
          <GuestCountStep
            eventType={state.eventType}
            value={state.guestCount}
            onChange={(count) => dispatch({ type: 'SET_GUEST_COUNT', payload: count })}
            onNext={goNext}
          />
        );
      case 'drinking-vibe':
        return (
          <DrinkingVibeStep
            selected={state.drinkingVibe}
            onSelect={(vibe) => {
              dispatch({ type: 'SET_DRINKING_VIBE', payload: vibe });
              setDirection(1);
              setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 350);
            }}
          />
        );
      case 'duration':
        return (
          <DurationStep
            eventType={state.eventType}
            selected={state.duration}
            onSelect={(d) => {
              dispatch({ type: 'SET_DURATION', payload: d });
              setDirection(1);
              setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 350);
            }}
          />
        );
      case 'drink-types':
        return (
          <DrinkTypesStep
            selected={state.drinkCategories}
            onToggle={(cat: DrinkCategory) => dispatch({ type: 'TOGGLE_DRINK_CATEGORY', payload: cat })}
            onQuickSelect={() => dispatch({ type: 'SET_DRINK_CATEGORIES', payload: ['beer', 'seltzers'] })}
            onNext={goNext}
          />
        );
      case 'cocktail-pick':
        return (
          <CocktailPickStep
            selected={state.selectedCocktails}
            onToggle={(id: string) => {
              const next = state.selectedCocktails.includes(id)
                ? state.selectedCocktails.filter(c => c !== id)
                : [...state.selectedCocktails, id];
              dispatch({ type: 'SET_SELECTED_COCKTAILS', payload: next });
            }}
            onSkip={() => {
              dispatch({ type: 'SET_SELECTED_COCKTAILS', payload: [] });
              goNext();
            }}
            onNext={goNext}
          />
        );
      case 'extras':
        return (
          <ExtrasStep
            selected={state.extras}
            onToggle={(extra: Extra) => dispatch({ type: 'TOGGLE_EXTRA', payload: extra })}
            onNext={goNext}
          />
        );
      case 'bartender':
        return (
          <BartenderStep
            selected={state.bartender}
            onSelect={(choice) => {
              dispatch({ type: 'SET_BARTENDER', payload: choice });
              setDirection(1);
              setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 350);
            }}
          />
        );
      case 'event-details':
        return (
          <EventDetailsStep
            timing={state.eventTiming}
            area={state.deliveryArea}
            onSetTiming={(t) => dispatch({ type: 'SET_EVENT_TIMING', payload: t })}
            onSetArea={(a) => dispatch({ type: 'SET_DELIVERY_AREA', payload: a })}
            onNext={goNext}
          />
        );
      case 'results':
        return (
          <ResultsStep
            state={state}
            onAddAllToCart={handleAddAllToCart}
            onReset={handleReset}
            onSetPackageTier={(tier) => dispatch({ type: 'SET_PACKAGE_TIER', payload: tier })}
          />
        );
      default:
        return null;
    }
  }
}
