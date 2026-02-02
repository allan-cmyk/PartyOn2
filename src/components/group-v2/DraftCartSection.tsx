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
      <div className="text-center py-8 text-v2-muted">
        <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 15.546m18-3.046c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0" />
        </svg>
        <p className="text-sm font-medium text-v2-text">No items yet</p>
        <p className="text-xs mt-1">Share the link and start adding drinks!</p>
      </div>
    );
  }

  const safeItems = items || [];
  const total = safeItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-v2-text uppercase tracking-wide text-center md:text-left">
          Draft Cart ({items.length} items)
        </h3>
        <span className="text-sm font-semibold text-v2-text">
          ${total.toFixed(2)}
        </span>
      </div>
      <div className="divide-y divide-v2-border">
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
