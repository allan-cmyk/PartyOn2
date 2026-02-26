'use client';

import { useState, forwardRef, type ReactElement } from 'react';
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
  isLocked?: boolean;
  onItemChanged: () => void;
  onCheckoutMine: () => void;
  onCheckoutAll: () => void;
  onShareClick: () => void;
  onAddLocation: () => void;
}

const OrderSidebar = forwardRef<HTMLDivElement, Props>(function OrderSidebar(
  {
    shareCode,
    tabId,
    participantId,
    participants,
    draftItems,
    purchasedItems,
    isLocked,
    onItemChanged,
    onCheckoutMine,
    onCheckoutAll,
    onShareClick,
    onAddLocation,
  },
  ref
): ReactElement {
  const [expanded, setExpanded] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isSolo = participants.filter((p) => p.status === 'ACTIVE').length <= 1;
  const myItems = draftItems.filter((i) => i.addedBy.id === participantId);
  const othersItems = draftItems.filter((i) => i.addedBy.id !== participantId);
  const myPurchased = purchasedItems.filter((i) => i.purchaser.id === participantId);
  const othersPurchased = purchasedItems.filter((i) => i.purchaser.id !== participantId);

  const totalQty = myItems.reduce((sum, i) => sum + i.quantity, 0);
  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allDraftTotal = draftItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const hasPurchased = purchasedItems.length > 0;

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

  // Group others' items by participant
  const othersByParticipant = new Map<string, { name: string; items: DraftCartItemView[]; purchased: PurchasedItemView[] }>();
  for (const item of othersItems) {
    const key = item.addedBy.id;
    if (!othersByParticipant.has(key)) {
      othersByParticipant.set(key, { name: item.addedBy.name, items: [], purchased: [] });
    }
    othersByParticipant.get(key)!.items.push(item);
  }
  for (const item of othersPurchased) {
    const key = item.purchaser.id;
    if (!othersByParticipant.has(key)) {
      othersByParticipant.set(key, { name: item.purchaser.name, items: [], purchased: [] });
    }
    othersByParticipant.get(key)!.purchased.push(item);
  }

  const isEmpty = draftItems.length === 0 && purchasedItems.length === 0;

  function renderItemRow(item: DraftCartItemView, editable: boolean) {
    const isUpdating = updatingId === item.id;
    return (
      <div key={item.id} className="flex items-center gap-3 py-3">
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="56px"
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
          <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
        </div>
        {editable && !isLocked ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleUpdate(item.id, item.quantity - 1)}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              {item.quantity === 1 ? (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <span className="text-base font-medium">-</span>
              )}
            </button>
            <span className="w-7 text-center text-base font-semibold">
              {isUpdating ? (
                <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => handleUpdate(item.id, item.quantity + 1)}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              <span className="text-base font-medium">+</span>
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">x{item.quantity}</span>
        )}
        <span className="text-base font-semibold text-gray-900 w-20 text-right">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    );
  }

  function renderPurchasedRow(item: PurchasedItemView) {
    return (
      <div key={item.id} className="flex items-center gap-3 py-3 opacity-50">
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 relative overflow-hidden">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="56px"
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
        <span className="text-sm text-gray-500 w-20 text-right">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    );
  }

  // Desktop sidebar content
  function renderCartContent() {
    if (isEmpty) {
      return (
        <div className="text-center py-12 px-4">
          <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4m0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-base text-gray-500">Your cart is empty</p>
          <p className="text-sm text-gray-400 mt-1">Browse products to get started</p>
        </div>
      );
    }

    if (isSolo) {
      return (
        <>
          <div className="divide-y divide-gray-100 px-5">
            {myItems.map((item) => renderItemRow(item, true))}
            {myPurchased.map(renderPurchasedRow)}
          </div>
          {renderCheckoutButtons()}
        </>
      );
    }

    // Multi-participant view
    return (
      <>
        <div className="px-5">
          {/* Your items */}
          {(myItems.length > 0 || myPurchased.length > 0) && (
            <div className="pb-3">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 pt-3">
                Your Items
              </p>
              <div className="divide-y divide-gray-100">
                {myItems.map((item) => renderItemRow(item, true))}
                {myPurchased.map(renderPurchasedRow)}
              </div>
            </div>
          )}

          {/* Others' items grouped by person */}
          {Array.from(othersByParticipant.entries()).map(([pid, group]) => (
            <div key={pid} className="pb-3 border-t border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 pt-3">
                {group.name}&apos;s Items
              </p>
              <div className="divide-y divide-gray-100">
                {group.items.map((item) => renderItemRow(item, false))}
                {group.purchased.map(renderPurchasedRow)}
              </div>
            </div>
          ))}
        </div>
        {renderCheckoutButtons()}
      </>
    );
  }

  function renderCheckoutButtons() {
    if (isEmpty) return null;

    return (
      <div data-tour="checkout-buttons" className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        {isSolo ? (
          <button
            onClick={onCheckoutMine}
            disabled={myItems.length === 0 || isLocked}
            className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Checkout - ${myTotal.toFixed(2)}
          </button>
        ) : (
          <div className="space-y-2">
            {myItems.length > 0 && (
              <button
                onClick={onCheckoutMine}
                disabled={isLocked}
                className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
              >
                Checkout My Items - ${myTotal.toFixed(2)}
              </button>
            )}
            {draftItems.length > 0 && (
              <button
                onClick={onCheckoutAll}
                disabled={isLocked}
                className="w-full py-3 bg-brand-yellow text-gray-900 text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {hasPurchased
                  ? `Pay for Remaining - $${allDraftTotal.toFixed(2)}`
                  : `Pay for Everything - $${allDraftTotal.toFixed(2)}`}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderSecondaryActions() {
    return (
      <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={onShareClick}
          className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={onAddLocation}
          className="flex-1 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Add Location
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar -- hidden on mobile */}
      <div className="hidden lg:block">
        <div data-tour="cart" className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4m0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-base font-semibold text-gray-900">
                Cart ({totalQty} item{totalQty !== 1 ? 's' : ''})
              </span>
              <span className="ml-auto text-base font-bold text-gray-900">
                ${myTotal.toFixed(2)}
              </span>
            </div>
          </div>
          {renderCartContent()}
          {renderSecondaryActions()}
        </div>
      </div>

      {/* Mobile collapsible cart -- hidden when empty */}
      {!isEmpty && (
        <div ref={ref} className="lg:hidden mb-6" data-tour="cart">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4m0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-base font-semibold text-gray-900">
                  Cart ({totalQty} item{totalQty !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-gray-900">${myTotal.toFixed(2)}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expanded && (
              <div className="border-t border-gray-100">
                {renderCartContent()}
                {renderSecondaryActions()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default OrderSidebar;
