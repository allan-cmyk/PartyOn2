'use client';

import type { EventTiming, DeliveryArea } from '@/lib/drinkPlannerTypes';

interface EventDetailsStepProps {
  timing: EventTiming | null;
  area: DeliveryArea | null;
  onSetTiming: (timing: EventTiming) => void;
  onSetArea: (area: DeliveryArea) => void;
  onNext: () => void;
}

const TIMING_OPTIONS: { id: EventTiming; label: string }[] = [
  { id: 'this-weekend', label: 'This Weekend' },
  { id: 'next-weekend', label: 'Next Weekend' },
  { id: '2-weeks-out', label: '2+ Weeks Out' },
  { id: 'just-browsing', label: 'Just Browsing' },
];

const AREA_OPTIONS: { id: DeliveryArea; label: string }[] = [
  { id: 'austin', label: 'Austin' },
  { id: 'lake-travis', label: 'Lake Travis' },
  { id: 'other', label: 'Other' },
];

export default function EventDetailsStep({ timing, area, onSetTiming, onSetArea, onNext }: EventDetailsStepProps) {
  return (
    <div className="max-w-xl mx-auto px-4">
      <h2 className="text-center text-3xl md:text-4xl font-heading font-light text-white tracking-[0.08em] mb-3">
        When &amp; where?
      </h2>
      <p className="text-center text-gray-400 text-sm tracking-[0.08em] mb-10">
        Almost there!
      </p>

      {/* Event timing */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-400 tracking-[0.12em] uppercase mb-4">
          Event Date
        </h3>
        <div className="flex flex-wrap gap-2">
          {TIMING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSetTiming(opt.id)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                ${timing === opt.id
                  ? 'bg-brand-yellow text-gray-900 border-brand-yellow'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-400'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery area */}
      <div className="mb-10">
        <h3 className="text-sm font-medium text-gray-400 tracking-[0.12em] uppercase mb-4">
          Delivery Area
        </h3>
        <div className="flex flex-wrap gap-2">
          {AREA_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSetArea(opt.id)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                ${area === opt.id
                  ? 'bg-brand-yellow text-gray-900 border-brand-yellow'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-400'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onNext}
          className="bg-brand-yellow text-gray-900 font-semibold text-base px-10 py-3.5 rounded-full tracking-[0.08em] hover:bg-yellow-400 transition-colors shadow-lg"
        >
          SEE MY PLAN
        </button>
      </div>
    </div>
  );
}
