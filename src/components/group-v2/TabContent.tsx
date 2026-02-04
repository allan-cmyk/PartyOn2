'use client';

import { ReactElement, useCallback, useState } from 'react';
import TabDeliveryInfo from './TabDeliveryInfo';
import DraftCartSection from './DraftCartSection';
import PurchasedSection from './PurchasedSection';
import ParticipantCheckoutButton from './ParticipantCheckoutButton';
import EditTabModal from './EditTabModal';
import DeliveryFeeInvoice from './DeliveryFeeInvoice';
import {
  updateDraftItemV2,
  removeDraftItemV2,
} from '@/lib/group-orders-v2/api-client';
import type { SubOrderFull } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  tab: SubOrderFull;
  currentParticipantId: string | null;
  isHost: boolean;
  onRefresh: () => void;
  onCheckout?: () => void;
}

export default function TabContent({
  shareCode,
  tab,
  currentParticipantId,
  isHost,
  onRefresh,
  onCheckout,
}: Props): ReactElement {
  const isPastDeadline = tab.orderDeadline ? new Date(tab.orderDeadline) < new Date() : false;
  const isLocked = tab.status !== 'OPEN' || isPastDeadline;
  const [showEditTab, setShowEditTab] = useState(false);

  const handleUpdateQty = useCallback(
    async (itemId: string, quantity: number) => {
      if (!currentParticipantId) return;
      try {
        await updateDraftItemV2(
          shareCode,
          tab.id,
          itemId,
          currentParticipantId,
          quantity
        );
        onRefresh();
      } catch (err) {
        console.error('Failed to update item:', err);
      }
    },
    [shareCode, tab.id, currentParticipantId, onRefresh]
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      if (!currentParticipantId) return;
      try {
        await removeDraftItemV2(
          shareCode,
          tab.id,
          itemId,
          currentParticipantId
        );
        onRefresh();
      } catch (err) {
        console.error('Failed to remove item:', err);
      }
    },
    [shareCode, tab.id, currentParticipantId, onRefresh]
  );

  const draftItems = tab.draftItems || [];
  const myItems = currentParticipantId
    ? draftItems.filter((i) => i.addedBy?.id === currentParticipantId)
    : [];

  return (
    <div className="space-y-6">
      {/* Delivery Info */}
      <TabDeliveryInfo
        tab={tab}
        isHost={isHost}
        onEdit={() => setShowEditTab(true)}
      />

      {/* Status banners */}
      {tab.status === 'LOCKED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          This tab is locked by the host. You can still checkout your existing items.
        </div>
      )}

      {isPastDeadline && tab.status === 'OPEN' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          The ordering deadline has passed. You can still checkout your existing items.
        </div>
      )}

      {tab.status === 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          This delivery was cancelled by the host.
        </div>
      )}

      {tab.status === 'FULFILLED' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          This delivery is complete!
        </div>
      )}

      {/* Draft Cart */}
      {tab.status !== 'CANCELLED' && tab.status !== 'FULFILLED' && (
        <div className="bg-white rounded-lg border border-v2-border p-4">
          <DraftCartSection
            items={draftItems}
            currentParticipantId={currentParticipantId}
            isHost={isHost}
            onUpdateQty={isLocked ? undefined : handleUpdateQty}
            onRemove={isLocked ? undefined : handleRemoveItem}
          />
        </div>
      )}

      {/* Checkout Button — opens summary modal (hidden on mobile, shown via MobileCheckoutBar instead) */}
      {currentParticipantId && myItems.length > 0 && tab.status !== 'CANCELLED' && tab.status !== 'FULFILLED' && (
        <div className="hidden md:block">
          <ParticipantCheckoutButton
            shareCode={shareCode}
            tabId={tab.id}
            participantId={currentParticipantId}
            items={draftItems}
            onCheckout={onCheckout}
          />
        </div>
      )}

      {/* Purchased Items */}
      <PurchasedSection items={tab.purchasedItems || []} />

      {/* Host: Delivery Fee Invoice */}
      {isHost && currentParticipantId && (
        <DeliveryFeeInvoice
          shareCode={shareCode}
          tab={tab}
          hostParticipantId={currentParticipantId}
        />
      )}

      {/* Edit Tab Modal (host only) */}
      {isHost && currentParticipantId && (
        <EditTabModal
          shareCode={shareCode}
          hostParticipantId={currentParticipantId}
          tab={tab}
          isOpen={showEditTab}
          onClose={() => setShowEditTab(false)}
          onUpdated={onRefresh}
        />
      )}
    </div>
  );
}
