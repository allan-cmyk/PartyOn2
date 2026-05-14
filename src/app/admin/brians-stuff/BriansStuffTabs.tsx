'use client';

/**
 * Client shell for /admin/brians-stuff with two tabs:
 *   - Landing Page Playbook
 *   - Upsell A/B Tracker
 *
 * Server passes pre-rendered tracker content as a ReactNode prop so the
 * heavy DB query stays server-side; this component just toggles which
 * panel is visible.
 *
 * Initial tab is driven by ?tab= query param ("playbook" | "upsell") so
 * old /admin/upsell-tracker links land directly on the right panel after
 * redirect.
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type TabKey = 'playbook' | 'upsell';

export default function BriansStuffTabs({
  playbook,
  tracker,
  initialTab = 'playbook',
}: {
  playbook: ReactNode;
  tracker: ReactNode;
  initialTab?: TabKey;
}) {
  const [tab, setTab] = useState<TabKey>(initialTab);

  // Keep the URL ?tab= synced when user clicks (lets them deep-link / refresh)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (tab === 'playbook') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  }, [tab]);

  return (
    <div className="-m-6 md:-m-8 lg:-m-10">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 md:px-10 flex gap-1">
          <TabButton active={tab === 'playbook'} onClick={() => setTab('playbook')}>
            📘 Landing Page Playbook
          </TabButton>
          <TabButton active={tab === 'upsell'} onClick={() => setTab('upsell')}>
            ★ Upsell A/B Tracker
          </TabButton>
        </div>
      </div>

      {/* Each panel is mounted but hidden so server-rendered content (the
          tracker) renders once and stays warm when toggling tabs. */}
      <div hidden={tab !== 'playbook'}>{playbook}</div>
      <div hidden={tab !== 'upsell'} className="px-6 md:px-10 py-8">
        {tracker}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-3 text-sm font-bold border-b-2 transition-colors"
      style={{
        borderColor: active ? '#7C3AED' : 'transparent',
        color: active ? '#5B21B6' : '#6B7280',
      }}
    >
      {children}
    </button>
  );
}
