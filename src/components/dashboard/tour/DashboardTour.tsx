'use client';

import { useEffect, useRef } from 'react';
import type { TourStep } from './OnboardingTourProvider';
import useTour from './useTour';

interface Props {
  isHost: boolean;
  hasPartyType: boolean;
  shareCode: string;
}

function buildSteps(): TourStep[] {
  return [
    {
      target: '[data-tour="delivery-details"]',
      title: 'Delivery Details',
      content:
        'Set your delivery date, time, and address here. Tap to expand and edit.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="add-tab"]',
      title: 'Multiple Locations',
      content:
        'Need a house delivery AND a boat drop-off? Add another location tab here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="participants"]',
      title: 'See Your Group',
      content:
        'View who has joined your order. Everyone can add and edit items.',
      placement: 'bottom-end',
    },
    {
      target: '[data-tour="share-button"]',
      title: 'Invite Friends',
      content:
        "Share this link so friends can add their own items to the order. Everyone's items are tracked separately.",
      placement: 'bottom-end',
    },
    {
      target: '[data-tour="add-host"]',
      title: 'Add Another Host',
      content:
        'Give someone else full host access so they can manage the order too.',
      placement: 'bottom-end',
    },
  ];
}

export default function DashboardTour({
  isHost,
  hasPartyType,
  shareCode,
}: Props) {
  const { startTour, isRunning } = useTour();
  const startedRef = useRef(false);

  useEffect(() => {
    // Don't start if: not host, onboarding popup is pending (!hasPartyType),
    // tour already running, or already attempted
    if (!isHost || !hasPartyType || isRunning || startedRef.current) return;

    // Check if already completed in localStorage
    try {
      const raw = localStorage.getItem(
        `dashboard_tour_completed_${shareCode}`
      );
      const completed: string[] = raw ? JSON.parse(raw) : [];
      if (completed.includes('welcome')) return;
    } catch {
      // Ignore parse errors
    }

    startedRef.current = true;

    // Before starting, programmatically open the participant panel so the
    // "Add Another Host" button is visible for step 5.
    const participantBtn = document.querySelector(
      '[data-tour="participants"] button'
    ) as HTMLButtonElement | null;

    const timer = setTimeout(() => {
      // Click the participant button to open the panel
      if (participantBtn) {
        participantBtn.click();
      }

      // Small extra delay so the panel renders before measuring targets
      setTimeout(() => {
        const steps = buildSteps();
        startTour('welcome', steps);
      }, 100);
    }, 500);

    return () => clearTimeout(timer);
  }, [isHost, hasPartyType, isRunning, shareCode, startTour]);

  return null;
}
