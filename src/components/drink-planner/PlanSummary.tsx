'use client';

import type { QuizState } from '@/lib/drinkPlannerTypes';
import {
  EVENT_TYPE_LABELS,
  VIBE_LABELS,
  DURATION_LABELS,
  DRINK_CATEGORY_LABELS,
} from '@/lib/drinkPlannerTypes';

interface PlanSummaryProps {
  state: QuizState;
}

export default function PlanSummary({ state }: PlanSummaryProps) {
  const items: { label: string; value: string }[] = [];

  if (state.eventType) {
    items.push({ label: 'Event', value: EVENT_TYPE_LABELS[state.eventType] });
  }
  if (state.eventType) {
    items.push({ label: 'Guests', value: String(state.guestCount) });
  }
  if (state.drinkingVibe) {
    items.push({ label: 'Vibe', value: VIBE_LABELS[state.drinkingVibe].label });
  }
  if (state.duration) {
    items.push({ label: 'Duration', value: DURATION_LABELS[state.duration] });
  }
  if (state.drinkCategories.length > 0) {
    items.push({
      label: 'Drinks',
      value: state.drinkCategories.map(c => DRINK_CATEGORY_LABELS[c]).join(', '),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 sticky top-28">
      <h3 className="text-sm font-medium text-brand-yellow tracking-[0.15em] uppercase mb-4">
        Your Plan So Far
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-start gap-4">
            <span className="text-xs text-gray-400 tracking-[0.1em] uppercase flex-shrink-0">
              {item.label}
            </span>
            <span className="text-sm text-white text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
