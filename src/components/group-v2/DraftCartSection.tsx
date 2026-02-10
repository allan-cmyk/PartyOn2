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
      <div className="text-center py-16 text-gray-500">
        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 15.546m18-3.046c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0" />
        </svg>
        <p className="text-xl font-semibold text-gray-700">No items yet</p>
        <p className="text-lg mt-2">Share the link and start adding drinks!</p>
      </div>
    );
  }

  const safeItems = items || [];
  const total = safeItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-2xl md:text-3xl text-gray-900 uppercase tracking-wide">
          Draft Cart
          <span className="ml-3 text-lg font-normal font-sans text-gray-500">({items.length} items)</span>
        </h3>
        <span className="text-2xl md:text-3xl font-bold text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>
      <div className="space-y-4">
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
