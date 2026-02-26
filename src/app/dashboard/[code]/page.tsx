'use client';

import { useState, useEffect, useCallback, useRef, type ReactElement } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useGroupOrderV2 } from '@/lib/group-orders-v2/hooks';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DeliveryHeroSection from '@/components/dashboard/DeliveryHeroSection';
import OnboardingPopup from '@/components/dashboard/OnboardingPopup';
import OrderSidebar from '@/components/dashboard/OrderSidebar';
import ProductBrowse from '@/components/dashboard/ProductBrowse';
import DashboardBottomBar from '@/components/dashboard/DashboardBottomBar';
import DashboardCheckoutModal from '@/components/dashboard/DashboardCheckoutModal';
import DeliveryDetailsModal from '@/components/dashboard/DeliveryDetailsModal';
import NewDeliveryModal from '@/components/dashboard/NewDeliveryModal';
import GetRecsModal from '@/components/dashboard/GetRecsModal';
import RecommendationsSection from '@/components/dashboard/RecommendationsSection';
import ShareModal from '@/components/dashboard/ShareModal';
import JoinOverlay from '@/components/dashboard/JoinOverlay';
import type { RecommendationResult } from '@/components/dashboard/GetRecsModal';
import { claimHostV2 } from '@/lib/group-orders-v2/api-client';
import { OnboardingTourProvider, DashboardTour } from '@/components/dashboard/tour';

const PARTICIPANT_KEY_PREFIX = 'dashboard_participant_';

export default function DashboardPage(): ReactElement {
  const params = useParams() ?? {};
  const code = (params.code as string) || '';
  const searchParams = useSearchParams();
  const router = useRouter();

  const { groupOrder, isLoading, refresh } = useGroupOrderV2(code);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [checkoutMode, setCheckoutMode] = useState<'mine' | 'all' | null>(null);
  const [showGetRecs, setShowGetRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[] | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [needsJoin, setNeedsJoin] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);

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

    const stored = localStorage.getItem(`${PARTICIPANT_KEY_PREFIX}${code}`);

    if (stored) {
      const match = groupOrder.participants.find((p) => p.id === stored && p.status === 'ACTIVE');
      if (match) {
        setParticipantId(match.id);
        return;
      }
    }

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

  // Handle host claim token from URL
  useEffect(() => {
    if (!groupOrder || !participantId) return;
    const claimToken = searchParams?.get('claim');
    if (!claimToken) return;

    const alreadyHost = groupOrder.participants.find(
      (p) => p.id === participantId && p.isHost
    );
    if (alreadyHost) {
      // Already host, just strip the param
      router.replace(`/dashboard/${code}`);
      return;
    }

    claimHostV2(code, claimToken, participantId)
      .then(() => {
        refresh();
        router.replace(`/dashboard/${code}`);
      })
      .catch((err) => {
        console.error('Failed to claim host:', err);
        router.replace(`/dashboard/${code}`);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupOrder?.id, participantId]);

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
          <p className="text-base text-gray-500">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!participantId && needsJoin && groupOrder) {
    const host = groupOrder.participants.find((p) => p.isHost);
    const firstTab = groupOrder.tabs[0];
    const joinLocked = firstTab?.status === 'LOCKED';
    return (
      <JoinOverlay
        shareCode={code}
        orderName={groupOrder.name}
        hostName={host?.name || groupOrder.hostName}
        isLocked={joinLocked}
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
          <p className="text-base text-gray-500">Setting up...</p>
        </div>
      </div>
    );
  }

  // Ensure activeTabIndex is within bounds
  const safeTabIndex = Math.min(activeTabIndex, groupOrder.tabs.length - 1);
  const tab = groupOrder.tabs[safeTabIndex];
  if (!tab) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No location tab found.</p>
      </div>
    );
  }

  const isLocked = tab.status === 'LOCKED';

  const myDraftItems = tab.draftItems.filter(
    (i) => i.addedBy.id === participantId
  );
  const checkoutItems =
    checkoutMode === 'all' ? tab.draftItems : myDraftItems;

  const currentIsHost = !!groupOrder.participants.find(p => p.id === participantId)?.isHost;

  return (
    <OnboardingTourProvider shareCode={code}>
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-6">
      <DashboardTour
        isHost={currentIsHost}
        hasPartyType={!!groupOrder.partyType}
        shareCode={code}
      />
      <DashboardHeader
        groupOrder={groupOrder}
        participantId={participantId}
        isLocked={isLocked}
        onRefresh={refresh}
        onShareClick={() => setShowShareModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Left column: hero + recs + products */}
        <div>
          <DeliveryHeroSection
            groupOrder={groupOrder}
            activeTabIndex={safeTabIndex}
            activeTab={tab}
            participantId={participantId}
            onTabChange={setActiveTabIndex}
            onAddDelivery={() => setShowNewLocation(true)}
            onEditDelivery={() => setShowLocationDetails(true)}
            onRefresh={refresh}
          />
          {/* Mobile cart (hidden on desktop) */}
          <div className="lg:hidden">
            <OrderSidebar
              ref={cartRef}
              shareCode={groupOrder.shareCode}
              tabId={tab.id}
              participantId={participantId}
              participants={groupOrder.participants}
              draftItems={tab.draftItems}
              purchasedItems={tab.purchasedItems}
              isLocked={isLocked}
              onItemChanged={refresh}
              onCheckoutMine={() => setCheckoutMode('mine')}
              onCheckoutAll={() => setCheckoutMode('all')}
            />
          </div>

          {/* Get Recs button */}
          {!recommendations && (
            <div className="mb-4 flex justify-center">
              <button
                onClick={() => setShowGetRecs(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-yellow text-gray-900 font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Get Recommendations
              </button>
            </div>
          )}

          <ProductBrowse
            shareCode={groupOrder.shareCode}
            tabId={tab.id}
            participantId={participantId}
            draftItems={tab.draftItems}
            isLocked={isLocked}
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
        </div>

        {/* Right column: desktop sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <OrderSidebar
            shareCode={groupOrder.shareCode}
            tabId={tab.id}
            participantId={participantId}
            participants={groupOrder.participants}
            draftItems={tab.draftItems}
            purchasedItems={tab.purchasedItems}
            isLocked={isLocked}
            onItemChanged={refresh}
            onCheckoutMine={() => setCheckoutMode('mine')}
            onCheckoutAll={() => setCheckoutMode('all')}
          />
        </div>
      </main>

      <DashboardBottomBar
        participantId={participantId}
        draftItems={tab.draftItems}
        isLocked={isLocked}
        cartRef={cartRef}
        onCheckout={() => setCheckoutMode('mine')}
      />

      {checkoutMode && (
        <DashboardCheckoutModal
          shareCode={groupOrder.shareCode}
          tab={tab}
          participantId={participantId}
          mode={checkoutMode}
          items={checkoutItems}
          onClose={() => setCheckoutMode(null)}
          onOpenDeliveryDetails={() => {
            setCheckoutMode(null);
            setShowLocationDetails(true);
          }}
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

      {showLocationDetails && (
        <DeliveryDetailsModal
          shareCode={groupOrder.shareCode}
          tab={tab}
          participantId={participantId}
          onClose={() => setShowLocationDetails(false)}
          onSaved={() => {
            setShowLocationDetails(false);
            refresh();
          }}
        />
      )}

      {showNewLocation && (
        <NewDeliveryModal
          shareCode={groupOrder.shareCode}
          participantId={participantId}
          tabCount={groupOrder.tabs.length}
          onClose={() => setShowNewLocation(false)}
          onCreated={async () => {
            setShowNewLocation(false);
            const updated = await refresh();
            if (updated) {
              setActiveTabIndex(updated.tabs.length - 1);
            }
          }}
        />
      )}

      {showOnboarding && (
        <OnboardingPopup
          shareCode={groupOrder.shareCode}
          onComplete={() => {
            handleOnboardingDismiss();
          }}
          onDismiss={handleOnboardingDismiss}
        />
      )}
    </div>
    </OnboardingTourProvider>
  );
}
