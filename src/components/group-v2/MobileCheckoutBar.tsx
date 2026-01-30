'use client';

import { ReactElement } from 'react';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';

interface Props {
  items: DraftCartItemView[];
  participantId: string | null;
  onCheckout: () => void;
}

/**
 * Sticky bottom bar on mobile showing participant's items + checkout CTA.
 * Hidden on desktop where the inline checkout button is used instead.
 */
export default function MobileCheckoutBar({
  items,
  participantId,
  onCheckout,
}: Props): ReactElement | null {
  if (!participantId) return null;

  const myItems = items.filter((i) => i.addedBy.id === participantId);
  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (myItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:hidden">
      <button
        onClick={onCheckout}
        className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
      >
        <span>
          My Items ({myItems.length})
        </span>
        <span className="font-normal">·</span>
        <span>${myTotal.toFixed(2)}</span>
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
