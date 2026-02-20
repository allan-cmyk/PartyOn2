'use client';

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useParams } from 'next/navigation';
import { useGroupOrderV2 } from '@/lib/group-orders-v2/hooks';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OnboardingPopup from '@/components/dashboard/OnboardingPopup';
import ProductBrowse from '@/components/dashboard/ProductBrowse';
import DashboardBottomBar from '@/components/dashboard/DashboardBottomBar';
import CartDrawer from '@/components/dashboard/CartDrawer';
import DashboardCheckoutModal from '@/components/dashboard/DashboardCheckoutModal';
import GetRecsModal from '@/components/dashboard/GetRecsModal';
import RecommendationsSection from '@/components/dashboard/RecommendationsSection';
import ShareModal from '@/components/dashboard/ShareModal';
import JoinOverlay from '@/components/dashboard/JoinOverlay';
import type { RecommendationResult } from '@/components/dashboard/GetRecsModal';

const PARTICIPANT_KEY_PREFIX = 'dashboard_participant_';

export default function DashboardPage(): ReactElement {
  const params = useParams() ?? {};
  const code = (params.code as string) || '';

  const { groupOrder, isLoading, refresh } = useGroupOrderV2(code);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'mine' | 'all' | null>(null);
  const [showGetRecs, setShowGetRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[] | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [needsJoin, setNeedsJoin] = useState(false);

  // Restore participant ID from localStorage
  useEffect(() => {
    if (!code) return;
    const stored = localStorage.getItem(`${PARTICIPANT_KEY_PREFIX}${code}`);
    if (stored) {
      setParticipantId(stored);
    }
  }, [code]);

  // Detect whether user is a known participant or needs to join
  useEffect(() => {
    if (!groupOrder || participantId) return;

    // Check if the stored ID was cleared or never existed
    const stored = localStorage.getItem(`${PARTICIPANT_KEY_PREFIX}${code}`);

    if (stored) {
      // Stored ID exists but didn't match state yet (race condition guard)
      const match = groupOrder.participants.find((p) => p.id === stored && p.status === 'ACTIVE');
      if (match) {
        setParticipantId(match.id);
        return;
      }
    }

    // No stored participant -- the /order page sets localStorage before redirecting,
    // so if we have no entry, this is a guest visiting a shared link
    setNeedsJoin(true);
  }, [groupOrder, participantId, code]);

  // Show onboarding for new orders (no party type set yet)
  useEffect(() => {
    if (!groupOrder || !participantId) return;
    const isHost = groupOrder.participants.find(
      (p) => p.id === participantId
    )?.isHost;
    if (isHost && !groupOrder.partyType) {
      const dismissed = localStorage.getItem(`dashboard_onboarding_${code}`);
      if (!dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [groupOrder, participantId, code]);

  const handleOnboardingDismiss = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem(`dashboard_onboarding_${code}`, '1');
    refresh();
  }, [code, refresh]);

  if (isLoading || !groupOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!participantId && needsJoin && groupOrder) {
    const host = groupOrder.participants.find((p) => p.isHost);
    return (
      <JoinOverlay
        shareCode={code}
        orderName={groupOrder.name}
        hostName={host?.name || groupOrder.hostName}
        onJoined={(newPid) => {
          setParticipantId(newPid);
          localStorage.setItem(`${PARTICIPANT_KEY_PREFIX}${code}`, newPid);
          setNeedsJoin(false);
          refresh();
        }}
      />
    );
  }

  if (!participantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Setting up...</p>
        </div>
      </div>
    );
  }

  const tab = groupOrder.tabs[0];
  if (!tab) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No delivery tab found.</p>
      </div>
    );
  }

  const myDraftItems = tab.draftItems.filter(
    (i) => i.addedBy.id === participantId
  );
  const checkoutItems =
    checkoutMode === 'all' ? tab.draftItems : myDraftItems;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader
        groupOrder={groupOrder}
        participantId={participantId}
        onRefresh={refresh}
        onShareClick={() => setShowShareModal(true)}
      />

      {showOnboarding && (
        <OnboardingPopup
          shareCode={groupOrder.shareCode}
          tabId={tab.id}
          participantId={participantId}
          initialPartyType={groupOrder.partyType}
          initialName={groupOrder.name}
          initialDeliveryContext={tab.deliveryContextType}
          onComplete={() => {
            handleOnboardingDismiss();
          }}
          onDismiss={handleOnboardingDismiss}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Get Recs button */}
        {!recommendations && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowGetRecs(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get Drink Recommendations
            </button>
          </div>
        )}

        <ProductBrowse
          shareCode={groupOrder.shareCode}
          tabId={tab.id}
          participantId={participantId}
          draftItems={tab.draftItems}
          onItemChanged={refresh}
          recsSection={
            recommendations ? (
              <RecommendationsSection
                recommendations={recommendations}
                shareCode={groupOrder.shareCode}
                tabId={tab.id}
                participantId={participantId}
                onItemChanged={refresh}
                onDismiss={() => setRecommendations(null)}
              />
            ) : null
          }
        />
      </main>

      <DashboardBottomBar
        participantId={participantId}
        draftItems={tab.draftItems}
        onCartToggle={() => setShowCart(!showCart)}
      />

      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        shareCode={groupOrder.shareCode}
        tabId={tab.id}
        participantId={participantId}
        participants={groupOrder.participants}
        draftItems={tab.draftItems}
        purchasedItems={tab.purchasedItems}
        onItemChanged={refresh}
        onCheckoutMine={() => {
          setShowCart(false);
          setCheckoutMode('mine');
        }}
        onCheckoutAll={() => {
          setShowCart(false);
          setCheckoutMode('all');
        }}
      />

      {checkoutMode && (
        <DashboardCheckoutModal
          shareCode={groupOrder.shareCode}
          tab={tab}
          participantId={participantId}
          mode={checkoutMode}
          items={checkoutItems}
          onClose={() => setCheckoutMode(null)}
          onRefresh={refresh}
        />
      )}

      {showGetRecs && (
        <GetRecsModal
          shareCode={groupOrder.shareCode}
          onRecommendations={(recs) => {
            setRecommendations(recs);
            setShowGetRecs(false);
          }}
          onClose={() => setShowGetRecs(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          shareCode={groupOrder.shareCode}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
