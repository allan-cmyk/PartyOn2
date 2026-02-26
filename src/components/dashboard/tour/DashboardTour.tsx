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
      target: '[data-tour="share-button"]',
      title: 'Invite Friends',
      content:
        'Share this link so friends can add their own items to the order. Everyone can add, edit, and purchase their own items.',
      placement: 'bottom-end',
    },
    {
      target: '[data-tour="participants"]',
      title: 'See Your Group',
      content:
        'View who has joined your order. Add another host to help manage the order.',
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
    if (!isHost || !hasPartyType || isRunning || startedRef.current) return;

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

    const timer = setTimeout(() => {
      const steps = buildSteps();
      startTour('welcome', steps);
    }, 500);

    return () => clearTimeout(timer);
  }, [isHost, hasPartyType, isRunning, shareCode, startTour]);

  return null;
}
