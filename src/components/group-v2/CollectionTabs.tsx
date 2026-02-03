'use client';

import { ReactElement } from 'react';
import { OrderCollection } from '@/lib/group-orders-v2/order-types';

interface Props {
  collections: OrderCollection[];
  activeHandle: string;
  onSelect: (handle: string) => void;
}

export default function CollectionTabs({ collections, activeHandle, onSelect }: Props): ReactElement | null {
  if (collections.length <= 1) return null;

  return (
    <div className="mb-3 overflow-x-auto flex gap-1.5">
      {collections.map((col) => (
        <button
          key={col.handle}
          onClick={() => onSelect(col.handle)}
          className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors ${
            col.handle === activeHandle
              ? 'bg-brand-blue text-white rounded-md shadow-sm'
              : 'bg-v2-bgSoft text-v2-muted hover:text-v2-text rounded-md'
          }`}
        >
          {col.label}
        </button>
      ))}
    </div>
  );
}
