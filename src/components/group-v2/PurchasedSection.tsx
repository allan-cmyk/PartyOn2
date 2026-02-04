'use client';

import { useState, ReactElement } from 'react';
import type { PurchasedItemView } from '@/lib/group-orders-v2/types';

interface Props {
  items: PurchasedItemView[];
}

export default function PurchasedSection({ items }: Props): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return <></>;

  const total = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

  // Group by purchaser
  const byPurchaser = items.reduce<Record<string, PurchasedItemView[]>>((acc, item) => {
    const key = item.purchaser?.id ?? 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="border-2 border-green-200 rounded-xl bg-green-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-semibold text-green-800">
            Purchased Items ({items.length})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-green-800">
            ${total.toFixed(2)}
          </span>
          <svg
            className={`w-5 h-5 text-green-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-4">
          {Object.entries(byPurchaser).map(([key, purchaserItems]) => {
            const purchaser = purchaserItems[0]?.purchaser;
            return (
              <div key={key}>
                <p className="text-base font-semibold text-green-700 mb-3">
                  {purchaser?.name ?? 'Unknown'}
                </p>
                {purchaserItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 text-base">
                    <div className="flex items-center gap-3">
                      <span className="text-v2-text font-medium">{item.title}</span>
                      <span className="text-v2-muted">x{item.quantity}</span>
                    </div>
                    <span className="text-v2-text font-semibold">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
