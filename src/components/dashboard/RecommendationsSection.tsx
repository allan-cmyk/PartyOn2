'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import type { RecommendationResult } from './GetRecsModal';
import { addDraftItemV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  recommendations: RecommendationResult[];
  shareCode: string;
  tabId: string;
  participantId: string;
  onItemChanged: () => void;
  onDismiss: () => void;
}

export default function RecommendationsSection({
  recommendations,
  shareCode,
  tabId,
  participantId,
  onItemChanged,
  onDismiss,
}: Props): ReactElement | null {
  const [addingAll, setAddingAll] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || recommendations.length === 0) return null;

  const matchedRecs = recommendations.filter((r) => r.matchedProduct);

  async function handleAddOne(rec: RecommendationResult) {
    if (!rec.matchedProduct || addingId) return;
    setAddingId(rec.matchedProduct.id);
    try {
      await addDraftItemV2(shareCode, tabId, {
        participantId,
        productId: rec.matchedProduct.id,
        variantId: rec.matchedProduct.variantId,
        title: rec.matchedProduct.title,
        price: rec.matchedProduct.price,
        imageUrl: rec.matchedProduct.imageUrl || undefined,
        quantity: rec.quantity,
      });
      onItemChanged();
    } catch (err) {
      console.error('Failed to add rec:', err);
    } finally {
      setAddingId(null);
    }
  }

  async function handleAddAll() {
    if (addingAll) return;
    setAddingAll(true);
    try {
      for (const rec of matchedRecs) {
        if (!rec.matchedProduct) continue;
        await addDraftItemV2(shareCode, tabId, {
          participantId,
          productId: rec.matchedProduct.id,
          variantId: rec.matchedProduct.variantId,
          title: rec.matchedProduct.title,
          price: rec.matchedProduct.price,
          imageUrl: rec.matchedProduct.imageUrl || undefined,
          quantity: rec.quantity,
        });
      }
      onItemChanged();
    } catch (err) {
      console.error('Failed to add all recs:', err);
    } finally {
      setAddingAll(false);
    }
  }

  return (
    <section className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900">
          Recommended for You
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAll}
            disabled={addingAll || matchedRecs.length === 0}
            className="px-4 py-2 bg-brand-yellow text-gray-900 text-xs font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {addingAll ? 'Adding...' : 'Add All'}
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              onDismiss();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {recommendations.map((rec, idx) => {
          const mp = rec.matchedProduct;
          const isAdding = addingId === mp?.id;
          return (
            <div
              key={idx}
              className="bg-white rounded-md border border-yellow-200 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square bg-gray-100">
                {mp?.imageUrl ? (
                  <Image
                    src={mp.imageUrl}
                    alt={mp.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] text-center p-1">
                    {rec.name}
                  </div>
                )}
                {/* Quantity badge */}
                <span className="absolute top-0.5 right-0.5 bg-yellow-500 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                  {rec.quantity}x
                </span>
              </div>
              <div className="p-1.5 flex-1 flex flex-col">
                <p className="text-[11px] font-medium text-gray-900 line-clamp-1 leading-tight">
                  {mp?.title || rec.name}
                </p>
                {mp && (
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    ${mp.price.toFixed(2)}
                  </p>
                )}
                <div className="mt-auto pt-0.5">
                  {mp ? (
                    <button
                      onClick={() => handleAddOne(rec)}
                      disabled={isAdding}
                      className="w-full py-1 bg-brand-yellow text-gray-900 text-[11px] font-semibold tracking-[0.08em] rounded hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50"
                    >
                      {isAdding ? '...' : 'Add'}
                    </button>
                  ) : (
                    <p className="text-[10px] text-gray-400 text-center">
                      N/A
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
