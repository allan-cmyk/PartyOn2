'use client';

import { type ReactElement } from 'react';
import type {
  DraftCartItemView,
  PurchasedItemView,
  ParticipantSummary,
} from '@/lib/group-orders-v2/types';
import DashboardCart from './DashboardCart';

interface Props {
  open: boolean;
  onClose: () => void;
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

export default function CartDrawer({
  open,
  onClose,
  shareCode,
  tabId,
  participantId,
  participants,
  draftItems,
  purchasedItems,
  onItemChanged,
  onCheckoutMine,
  onCheckoutAll,
}: Props): ReactElement | null {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart content */}
        <div className="flex-1 overflow-hidden">
          <DashboardCart
            shareCode={shareCode}
            tabId={tabId}
            participantId={participantId}
            participants={participants}
            draftItems={draftItems}
            purchasedItems={purchasedItems}
            onItemChanged={onItemChanged}
            onCheckoutMine={onCheckoutMine}
            onCheckoutAll={onCheckoutAll}
          />
        </div>
      </div>
    </div>
  );
}
