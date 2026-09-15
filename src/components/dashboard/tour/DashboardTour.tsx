'use client';

import { useEffect, useRef } from 'react';
import type { TourStep } from './OnboardingTourProvider';
import useTour from './useTour';

interface Props {
  isHost: boolean;
  hasPartyType: boolean;
  shareCode: string;
}

/**
 * Has the visitor answered the site-wide 21+ age gate? AgeVerification
 * stamps `age_verified` in localStorage on accept (and for partner embeds).
 * A read error counts as "not yet", matching LeadMagnetController.
 */
function isAgeVerified(): boolean {
  try {
    return !!localStorage.getItem('age_verified');
  } catch {
    return false;
  }
}

/** Partner embeds: inside an iframe, or opened with ?embed=1 / ?embedded=1. */
function isEmbedded(): boolean {
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true; // cross-origin access throws, which itself proves an embed
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('embed') === '1' || params.get('embedded') === '1';
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
    {
      target: '[data-tour="get-recs"]',
      title: 'Get Recommendations',
      content:
        'Not sure what to order? Use our drink calculator to get personalized recommendations based on your party size and preferences.',
      placement: 'top',
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
    // Partner embeds never showed the tour (the retired delivery-window gate
    // never fired there, and the tour waited on it); keep it that way.
    if (isEmbedded()) return;

    try {
      const raw = localStorage.getItem(
        `dashboard_tour_completed_${shareCode}`
      );
      const completed: string[] = raw ? JSON.parse(raw) : [];
      if (completed.includes('welcome')) return;
    } catch {
      // Ignore parse errors
    }

    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;

    const begin = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      startTimer = setTimeout(() => {
        startTour('welcome', buildSteps());
      }, 500);
    };

    // Don't start the tour until the 21+ age gate has been answered.
    // /dashboard is not age-gate exempt, and the tour renders above every
    // modal (z-9999), so starting sooner drops the tour spotlight on top of
    // a legally required gate. Poll until it's answered, then begin.
    if (isAgeVerified()) {
      begin();
    } else {
      poll = setInterval(() => {
        if (isAgeVerified()) {
          if (poll) clearInterval(poll);
          begin();
        }
      }, 300);
    }

    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (poll) clearInterval(poll);
    };
  }, [isHost, hasPartyType, isRunning, shareCode, startTour]);

  return null;
}
