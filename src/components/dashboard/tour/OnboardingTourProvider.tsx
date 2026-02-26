'use client';

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'bottom-end';
}

interface TourContextValue {
  isRunning: boolean;
  startTour: (tourId: string, steps: TourStep[]) => void;
  endTour: () => void;
  skipTour: () => void;
  resetTour: (tourId: string) => void;
}

export const TourContext = createContext<TourContextValue>({
  isRunning: false,
  startTour: () => {},
  endTour: () => {},
  skipTour: () => {},
  resetTour: () => {},
});

function getStorageKey(shareCode: string) {
  return `dashboard_tour_completed_${shareCode}`;
}

function getCompletedTours(shareCode: string): string[] {
  try {
    const raw = localStorage.getItem(getStorageKey(shareCode));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markTourCompleted(shareCode: string, tourId: string) {
  const completed = getCompletedTours(shareCode);
  if (!completed.includes(tourId)) {
    completed.push(tourId);
    localStorage.setItem(getStorageKey(shareCode), JSON.stringify(completed));
  }
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: 'top' | 'bottom' | 'left' | 'right';
}

function computePosition(
  targetRect: DOMRect,
  tooltipEl: HTMLDivElement,
  placement: TourStep['placement']
): TooltipPosition {
  const gap = 12;
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = 0;
  let left = 0;
  let arrowSide: TooltipPosition['arrowSide'] = 'top';

  switch (placement) {
    case 'bottom':
      top = targetRect.bottom + scrollY + gap;
      left = targetRect.left + scrollX + targetRect.width / 2 - tw / 2;
      arrowSide = 'top';
      break;
    case 'bottom-end':
      top = targetRect.bottom + scrollY + gap;
      left = targetRect.right + scrollX - tw;
      arrowSide = 'top';
      break;
    case 'top':
      top = targetRect.top + scrollY - th - gap;
      left = targetRect.left + scrollX + targetRect.width / 2 - tw / 2;
      arrowSide = 'bottom';
      break;
    case 'left':
      top = targetRect.top + scrollY + targetRect.height / 2 - th / 2;
      left = targetRect.left + scrollX - tw - gap;
      arrowSide = 'right';
      break;
    case 'right':
      top = targetRect.top + scrollY + targetRect.height / 2 - th / 2;
      left = targetRect.right + scrollX + gap;
      arrowSide = 'left';
      break;
  }

  // Clamp within viewport
  const vw = window.innerWidth;
  if (left < 8) left = 8;
  if (left + tw > vw - 8) left = vw - tw - 8;
  if (top < scrollY + 8) top = scrollY + 8;

  return { top, left, arrowSide };
}

function TourTooltip({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<TooltipPosition | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function position() {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el || !tooltipRef.current) return;

      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);

      // Scroll element into view if needed
      const viewportHeight = window.innerHeight;
      if (rect.top < 0 || rect.bottom > viewportHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Recompute after scroll settles
        setTimeout(() => {
          const newRect = el.getBoundingClientRect();
          setSpotlightRect(newRect);
          if (tooltipRef.current) {
            setPos(computePosition(newRect, tooltipRef.current, step.placement));
          }
        }, 350);
        return;
      }

      setPos(computePosition(rect, tooltipRef.current, step.placement));
    }

    // Small delay so DOM is ready
    const timer = setTimeout(position, 50);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [step.target, step.placement]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return createPortal(
    <>
      {/* Overlay with spotlight cutout */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={onSkip}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left - 4}
                  y={spotlightRect.top - 4}
                  width={spotlightRect.width + 8}
                  height={spotlightRect.height + 8}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#tour-spotlight-mask)"
            style={{ pointerEvents: 'all' }}
          />
        </svg>
        {/* Clickable spotlight area -- allow interacting with highlighted element */}
        {spotlightRect && (
          <div
            className="absolute"
            style={{
              left: spotlightRect.left - 4,
              top: spotlightRect.top - 4,
              width: spotlightRect.width + 8,
              height: spotlightRect.height + 8,
              borderRadius: '0.75rem',
              border: '2px solid rgba(11,116,184,0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-white shadow-2xl border border-gray-200"
        style={{
          zIndex: 9999,
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          width: 320,
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          opacity: pos ? 1 : 0,
          transition: 'opacity 0.15s ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        {pos && (
          <div
            className="absolute w-3 h-3 bg-white border border-gray-200 rotate-45"
            style={{
              ...(pos.arrowSide === 'top' && {
                top: -7,
                left: '50%',
                marginLeft: -6,
                borderBottom: 'none',
                borderRight: 'none',
              }),
              ...(pos.arrowSide === 'bottom' && {
                bottom: -7,
                left: '50%',
                marginLeft: -6,
                borderTop: 'none',
                borderLeft: 'none',
              }),
              ...(pos.arrowSide === 'left' && {
                left: -7,
                top: '50%',
                marginTop: -6,
                borderTop: 'none',
                borderRight: 'none',
              }),
              ...(pos.arrowSide === 'right' && {
                right: -7,
                top: '50%',
                marginTop: -6,
                borderBottom: 'none',
                borderLeft: 'none',
              }),
            }}
          />
        )}

        <h3
          className="font-bold text-gray-900 text-base mb-1"
          style={{ letterSpacing: '0.02em' }}
        >
          {step.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {stepIndex + 1}/{totalSteps}
            </span>
            {!isFirst && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors"
                style={{ color: '#0B74B8' }}
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors hover:opacity-90"
              style={{
                backgroundColor: '#0B74B8',
                letterSpacing: '0.08em',
              }}
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

interface Props {
  shareCode: string;
  children: ReactNode;
}

export default function OnboardingTourProvider({
  shareCode,
  children,
}: Props): ReactElement {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);

  const startTour = useCallback(
    (tourId: string, tourSteps: TourStep[]) => {
      const completed = getCompletedTours(shareCode);
      if (completed.includes(tourId)) return;
      setCurrentTourId(tourId);
      setSteps(tourSteps);
      setStepIndex(0);
      setIsRunning(true);
    },
    [shareCode]
  );

  const endTour = useCallback(() => {
    if (currentTourId) {
      markTourCompleted(shareCode, currentTourId);
    }
    setIsRunning(false);
    setCurrentTourId(null);
    setSteps([]);
    setStepIndex(0);
  }, [shareCode, currentTourId]);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  const resetTour = useCallback(
    (tourId: string) => {
      try {
        const completed = getCompletedTours(shareCode);
        const filtered = completed.filter((id) => id !== tourId);
        localStorage.setItem(
          getStorageKey(shareCode),
          JSON.stringify(filtered)
        );
      } catch {
        // Ignore
      }
    },
    [shareCode]
  );

  const handleNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      endTour();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, steps.length, endTour]);

  const handleBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const currentStep = isRunning && steps[stepIndex] ? steps[stepIndex] : null;

  return (
    <TourContext.Provider
      value={{ isRunning, startTour, endTour, skipTour, resetTour }}
    >
      {children}
      {currentStep && (
        <TourTooltip
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={skipTour}
        />
      )}
    </TourContext.Provider>
  );
}
