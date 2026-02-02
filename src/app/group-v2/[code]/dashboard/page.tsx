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
      <div className="pt-28 min-h-screen bg-v2-bgSoft flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-v2-text mb-2">
            Group Order Not Found
          </h1>
          <Link
            href="/group-v2/create"
            className="text-brand-blue hover:underline"
          >
            Create a new group order
          </Link>
        </div>
      </div>
    );
  }

  const activeTab = (groupOrder.tabs || []).find((t) => t.id === activeTabId);

  return (
    <div className="pt-24 min-h-screen bg-v2-bgSoft">
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
              <div className="bg-v2-card rounded-lg border border-v2-border p-10 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-v2-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 15.546m18-3.046c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 003 12.5m18-3.046c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0" />
                </svg>
                <p className="text-v2-text font-medium">No items yet</p>
                <p className="text-sm text-v2-muted mt-1">
                  Share the link to get the party started!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Participants + Host Controls */}
          <div className="space-y-4">
            <div className="bg-v2-card rounded-lg border border-v2-border p-4">
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
              <div className="bg-v2-card rounded-lg border border-v2-border p-4">
                <h3 className="text-sm font-semibold text-v2-text uppercase tracking-wide mb-3 text-center md:text-left">
                  Tab Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-v2-muted">
                    <span>Draft Subtotal</span>
                    <span>${(activeTab.totals?.draftSubtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-v2-muted">
                    <span>Purchased Subtotal</span>
                    <span>${(activeTab.totals?.purchasedSubtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-v2-muted">
                    <span>Delivery Fee</span>
                    <span>
                      {activeTab.deliveryFeeWaived
                        ? 'Waived'
                        : `$${(activeTab.totals?.deliveryFee ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-v2-border pt-2 flex justify-between font-medium text-v2-text">
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
