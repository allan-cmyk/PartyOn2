'use client';

import { ReactElement } from 'react';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  tabId: string;
  participantId: string;
  items: DraftCartItemView[];
  disabled?: boolean;
  onCheckout?: () => void;
}

export default function ParticipantCheckoutButton({
  participantId,
  items,
  disabled,
  onCheckout,
}: Props): ReactElement {
  const myItems = (items || []).filter((i) => i.addedBy?.id === participantId);
  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (myItems.length === 0) {
    return (
      <div className="py-3 px-4 bg-gray-50 rounded-lg text-center text-sm text-gray-400">
        Add items to checkout
      </div>
    );
  }

  return (
    <button
      onClick={onCheckout}
      disabled={disabled}
      className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      Checkout My Items ({myItems.length})
      <span className="font-normal">·</span>
      <span>${myTotal.toFixed(2)}</span>
    </button>
  );
}
