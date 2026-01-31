'use client';

import { ReactElement } from 'react';
import DraftCartItemRow from './DraftCartItemRow';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';

interface Props {
  items: DraftCartItemView[];
  currentParticipantId: string | null;
  isHost: boolean;
  onUpdateQty?: (itemId: string, qty: number) => void;
  onRemove?: (itemId: string) => void;
}

export default function DraftCartSection({
  items,
  currentParticipantId,
  isHost,
  onUpdateQty,
  onRemove,
}: Props): ReactElement {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No items yet</p>
        <p className="text-xs mt-1">Share the link and start adding drinks!</p>
      </div>
    );
  }

  const safeItems = items || [];
  const total = safeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Draft Cart ({items.length} items)
        </h3>
        <span className="text-sm font-semibold text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {safeItems.map((item) => (
          <DraftCartItemRow
            key={item.id}
            item={item}
            isOwner={item.addedBy?.id === currentParticipantId}
            isHost={isHost}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
