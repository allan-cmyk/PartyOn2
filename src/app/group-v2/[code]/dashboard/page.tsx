'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGroupOrderV2 } from '@/lib/group-orders-v2/hooks';
import { removeParticipantV2 } from '@/lib/group-orders-v2/api-client';
import GroupHeader from '@/components/group-v2/GroupHeader';
import TabBar from '@/components/group-v2/TabBar';
import TabContent from '@/components/group-v2/TabContent';
import ParticipantList from '@/components/group-v2/ParticipantList';
import HostControlBar from '@/components/group-v2/HostControlBar';
import MobileCheckoutBar from '@/components/group-v2/MobileCheckoutBar';
import CheckoutSummaryModal from '@/components/group-v2/CheckoutSummaryModal';
import DashboardSkeleton from '@/components/group-v2/DashboardSkeleton';
import CreateTabModal from '@/components/group-v2/CreateTabModal';

export default function DashboardPage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const { groupOrder, isLoading, error, refresh } = useGroupOrderV2(code);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showCreateTab, setShowCreateTab] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Restore participant ID from localStorage (scoped to this group code)
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('groupV2Code');
      const savedPid = localStorage.getItem('groupV2ParticipantId');
      if (savedPid && savedCode === code) setParticipantId(savedPid);
    } catch {
      // localStorage may be unavailable (private browsing, SSR)
    }
  }, [code]);

  // Set first tab as active, or reset if active tab was deleted
  useEffect(() => {
    const tabs = groupOrder?.tabs || [];
    if (!groupOrder || tabs.length === 0) return;
    const activeStillExists = activeTabId && tabs.some((t) => t.id === activeTabId);
    if (!activeStillExists) {
      setActiveTabId(tabs[0].id);
    }
  }, [groupOrder, activeTabId]);

  // Redirect if not a participant
  useEffect(() => {
    if (groupOrder && participantId) {
      const isParticipant = (groupOrder.participants || []).some(
        (p) => p.id === participantId && p.status === 'ACTIVE'
      );
      if (!isParticipant) {
        router.push(`/group-v2/${code}`);
      }
    }
  }, [groupOrder, participantId, code, router]);

  const isHost = !!(groupOrder?.participants || []).find(
    (p) => p.id === participantId && p.isHost
  );

  const handleRemoveParticipant = async (pid: string) => {
    if (!participantId || !confirm('Remove this participant? Their draft items will be deleted.')) return;
    try {
      await removeParticipantV2(code, pid, participantId);
      refresh();
    } catch (err) {
      console.error('Failed to remove participant:', err);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !groupOrder) {
    return (
      <div className="pt-28 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Group Order Not Found
          </h1>
          <Link
            href="/group-v2/create"
            className="text-gold-600 hover:underline"
          >
            Create a new group order
          </Link>
        </div>
      </div>
    );
  }

  const activeTab = (groupOrder.tabs || []).find((t) => t.id === activeTabId);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Header */}
      <GroupHeader groupOrder={groupOrder} isHost={isHost} />

      {/* Tab Bar */}
      <TabBar
        tabs={groupOrder.tabs || []}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onAddTab={isHost ? () => setShowCreateTab(true) : undefined}
        isHost={isHost}
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Tab Items + Catalog */}
          <div className="lg:col-span-2">
            {activeTab ? (
              <TabContent
                shareCode={code}
                tab={activeTab}
                currentParticipantId={participantId}
                isHost={isHost}
                onRefresh={refresh}
                onCheckout={() => setShowCheckout(true)}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 font-medium">No delivery tabs yet</p>
                {isHost ? (
                  <p className="text-sm text-gray-400 mt-1">
                    Add a delivery tab to start planning your group order.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">
                    The host hasn&apos;t added any delivery tabs yet. Hang tight!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Participants + Host Controls */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <ParticipantList
                participants={groupOrder.participants || []}
                isHost={isHost}
                onRemove={isHost ? handleRemoveParticipant : undefined}
              />
            </div>

            {/* Host Controls */}
            {isHost && participantId && (
              <HostControlBar
                groupOrder={groupOrder}
                activeTab={activeTab}
                hostParticipantId={participantId}
                onRefresh={refresh}
              />
            )}

            {/* Tab Summary */}
            {activeTab && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Tab Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Draft Subtotal</span>
                    <span>${(activeTab.totals?.draftSubtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Purchased Subtotal</span>
                    <span>${(activeTab.totals?.purchasedSubtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>
                      {activeTab.deliveryFeeWaived
                        ? 'Waived'
                        : `$${(activeTab.totals?.deliveryFee ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium text-gray-900">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        (activeTab.totals?.draftSubtotal ?? 0) +
                        (activeTab.totals?.purchasedSubtotal ?? 0) +
                        (activeTab.deliveryFeeWaived ? 0 : (activeTab.totals?.deliveryFee ?? 0))
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Tab Modal */}
      {participantId && (
        <CreateTabModal
          shareCode={code}
          hostParticipantId={participantId}
          isOpen={showCreateTab}
          onClose={() => setShowCreateTab(false)}
          onCreated={refresh}
        />
      )}

      {/* Mobile Sticky Checkout Bar */}
      {activeTab && (
        <MobileCheckoutBar
          items={activeTab.draftItems || []}
          participantId={participantId}
          onCheckout={() => setShowCheckout(true)}
        />
      )}

      {/* Checkout Summary Modal (shared between mobile bar + inline button) */}
      {activeTab && participantId && (
        <CheckoutSummaryModal
          shareCode={code}
          tab={activeTab}
          participantId={participantId}
          items={activeTab.draftItems || []}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
