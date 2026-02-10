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
    <div className="mb-4 overflow-x-auto flex gap-2 pb-1">
      {collections.map((col) => {
        if (!col?.colors) return null;
        const isActive = col.handle === activeHandle;
        return (
          <button
            key={col.handle}
            onClick={() => onSelect(col.handle)}
            className={`whitespace-nowrap px-4 py-2.5 text-xs md:text-sm font-medium tracking-[0.05em] transition-all rounded-lg border ${
              isActive
                ? `${col.colors.bgActive} ${col.colors.textActive} ${col.colors.borderActive} shadow-md`
                : `${col.colors.bg} ${col.colors.text} ${col.colors.border}`
            }`}
          >
            {col.label}
          </button>
        );
      })}
    </div>
  );
}
