/**
 * @fileoverview Mobile sticky CTA bar for Premier Party Cruises page
 * @module components/partners/PremierHeroStickyCTA
 */

'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';

interface PremierHeroStickyCTAProps {
  /** @deprecated No longer used — kept for backward compatibility with other partner pages */
  onJoinCode?: () => void;
}

/**
 * Fixed bottom CTA bar for mobile devices
 * Hidden on desktop, shows Order Your Drinks button
 */
export default function PremierHeroStickyCTA(props?: PremierHeroStickyCTAProps): ReactElement {
  void props;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gray-900 border-t border-gray-800 shadow-lg pb-safe">
      <div className="px-4 py-3 flex items-center justify-center">
        <Link
          href="/order"
          className="flex-1 py-3 bg-brand-yellow hover:bg-yellow-400 text-gray-900 font-semibold tracking-[0.08em] text-center rounded-lg transition-colors text-sm"
        >
          Order Your Drinks
        </Link>
      </div>
    </div>
  );
}
