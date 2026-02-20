'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import type {
  DraftCartItemView,
  PurchasedItemView,
  ParticipantSummary,
} from '@/lib/group-orders-v2/types';
import {
  updateDraftItemV2,
  removeDraftItemV2,
} from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  tabId: string;
  participantId: string;
  participants: ParticipantSummary[];
  draftItems: DraftCartItemView[];
  purchasedItems: PurchasedItemView[];
  onItemChanged: () => void;
  onCheckoutMine: () => void;
  onCheckoutAll: () => void;
}

export default function DashboardCart({
  shareCode,
  tabId,
  participantId,
  participants,
  draftItems,
  purchasedItems,
  onItemChanged,
  onCheckoutMine,
  onCheckoutAll,
}: Props): ReactElement {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isSolo = participants.filter((p) => p.status === 'ACTIVE').length <= 1;

  // Split items by participant
  const myItems = draftItems.filter((i) => i.addedBy.id === participantId);
  const othersItems = draftItems.filter((i) => i.addedBy.id !== participantId);
  const myPurchased = purchasedItems.filter(
    (i) => i.purchaser.id === participantId
  );
  const othersPurchased = purchasedItems.filter(
    (i) => i.purchaser.id !== participantId
  );

  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allDraftTotal = draftItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const remainingTotal = allDraftTotal;

  async function handleUpdate(itemId: string, newQty: number) {
    setUpdatingId(itemId);
    try {
      if (newQty <= 0) {
        await removeDraftItemV2(shareCode, tabId, itemId, participantId);
      } else {
        await updateDraftItemV2(shareCode, tabId, itemId, participantId, newQty);
      }
      onItemChanged();
    } catch (err) {
      console.error('Failed to update item:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  function renderItemRow(
    item: DraftCartItemView,
    editable: boolean
  ) {
    const isUpdating = updatingId === item.id;
    return (
      <div key={item.id} className="flex items-center gap-3 py-2">
        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-900 truncate">
            {item.title}
          </p>
          {item.variantTitle && (
            <p className="text-sm text-gray-500">{item.variantTitle}</p>
          )}
          <p className="text-sm text-gray-600">
            ${item.price.toFixed(2)} each
          </p>
        </div>
        {editable ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                handleUpdate(item.id, item.quantity - 1)
              }
              disabled={isUpdating}
              className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              {item.quantity === 1 ? (
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <span className="text-sm font-medium">-</span>
              )}
            </button>
            <span className="w-6 text-center text-sm font-semibold">
              {isUpdating ? (
                <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() =>
                handleUpdate(item.id, item.quantity + 1)
              }
              disabled={isUpdating}
              className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              <span className="text-sm font-medium">+</span>
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">x{item.quantity}</span>
        )}
        <span className="text-sm font-semibold text-gray-900 w-16 text-right">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    );
  }

  function renderPurchasedRow(item: PurchasedItemView) {
    return (
      <div key={item.id} className="flex items-center gap-3 py-2 opacity-50">
        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate line-through">
            {item.title}
          </p>
          <p className="text-sm text-green-600">Paid</p>
        </div>
        <span className="text-sm text-gray-500">x{item.quantity}</span>
        <span className="text-sm text-gray-500 w-16 text-right">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    );
  }

  if (draftItems.length === 0 && purchasedItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4m0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-sm">Your cart is empty</p>
        <p className="text-sm mt-1">Browse products and add items to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-gray-100">
        {isSolo ? (
          <>
            {myItems.map((item) => renderItemRow(item, true))}
            {myPurchased.map(renderPurchasedRow)}
          </>
        ) : (
          <>
            {/* Your items */}
            {(myItems.length > 0 || myPurchased.length > 0) && (
              <div className="pb-3">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Your Items
                </p>
                {myItems.map((item) => renderItemRow(item, true))}
                {myPurchased.map(renderPurchasedRow)}
              </div>
            )}

            {/* Others' items */}
            {(othersItems.length > 0 || othersPurchased.length > 0) && (
              <div className="pt-3">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Others&apos; Items
                </p>
                {othersItems.map((item) => renderItemRow(item, false))}
                {othersPurchased.map(renderPurchasedRow)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Totals + CTAs */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        {isSolo ? (
          <>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                ${myTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckoutMine}
              disabled={myItems.length === 0}
              className="w-full py-3 bg-brand-blue text-white font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout - ${myTotal.toFixed(2)}
            </button>
          </>
        ) : (
          <>
            {myItems.length > 0 && (
              <button
                onClick={onCheckoutMine}
                className="w-full py-2.5 mb-2 bg-brand-blue text-white font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm"
              >
                Checkout My Items - ${myTotal.toFixed(2)}
              </button>
            )}
            {draftItems.length > 0 && (
              <button
                onClick={onCheckoutAll}
                className="w-full py-2.5 bg-brand-yellow text-gray-900 font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors text-sm"
              >
                {purchasedItems.length > 0
                  ? `Pay for Remaining - $${remainingTotal.toFixed(2)}`
                  : `Pay for Everything - $${remainingTotal.toFixed(2)}`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
