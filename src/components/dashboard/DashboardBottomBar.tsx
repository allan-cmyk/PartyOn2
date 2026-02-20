'use client';

import { type ReactElement } from 'react';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';

interface Props {
  participantId: string;
  draftItems: DraftCartItemView[];
  onCartToggle: () => void;
}

export default function DashboardBottomBar({
  participantId,
  draftItems,
  onCartToggle,
}: Props): ReactElement | null {
  const myItems = draftItems.filter((i) => i.addedBy.id === participantId);
  const totalQty = myItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = myItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  if (totalQty === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onCartToggle}
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4m0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Cart ({totalQty})
        </button>
        <button
          onClick={onCartToggle}
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Checkout - ${totalPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
