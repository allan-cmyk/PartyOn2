/**
 * @fileoverview Mobile sticky CTA bar for Premier Party Cruises page
 * @module components/partners/PremierHeroStickyCTA
 */

'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';

interface PremierHeroStickyCTAProps {
  /** Callback when user clicks Join button */
  onJoinCode: () => void;
}

/**
 * Fixed bottom CTA bar for mobile devices
 * Hidden on desktop, shows Start Group Order and Join buttons
 */
export default function PremierHeroStickyCTA({
  onJoinCode,
}: PremierHeroStickyCTAProps): ReactElement {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gray-900 border-t border-gray-800 shadow-lg pb-safe">
      <div className="px-4 py-3 flex items-center gap-3">
        <Link
          href="/group/create"
          className="flex-1 py-3 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold tracking-wider text-center rounded-lg transition-colors text-sm"
        >
          Start Group Order
        </Link>
        <button
          onClick={onJoinCode}
          className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-sm border border-gray-700"
        >
          Join
        </button>
      </div>
    </div>
  );
}
