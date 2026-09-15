'use client';

/**
 * Dashboard banner for the deep-stock menu — an ops-only switch
 * (GroupOrderV2.isLastMinute, e.g. the boat dashboards ops restricted in
 * June 2026). Nothing customer-facing turns it on since the last-minute
 * ordering mode was retired (2026-09-15), so the copy stays neutral and makes
 * no delivery-speed promise (ADR-0010).
 *
 * Two visual states:
 *
 *   - DEFAULT (filter on): says the menu is limited to deep-stock items,
 *     with a "Show full menu →" button.
 *
 *   - FULL-MENU OVERRIDE (filter off, switch still on): says we'll confirm
 *     stock and text if a substitution is needed, with a way back.
 *
 * Mounted by /dashboard/[code]/page.tsx only when GroupOrderV2.isLastMinute
 * is true. The toggle state lives on the dashboard page so it can flip
 * the `allowedProductIds` prop on ProductBrowse.
 */
import type { ReactElement } from 'react';

const NAVY = '#0A1F33';
const GOLD = '#F2D34F';

type Props = {
  /** True when the customer has chosen to view the full menu anyway. */
  showFullMenu: boolean;
  onToggle: () => void;
};

/** In-stock menu banner with a full-menu toggle (see file header). */
export default function LastMinuteMenuBanner({ showFullMenu, onToggle }: Props): ReactElement {
  if (!showFullMenu) {
    // Default — deep-stock filter engaged.
    return (
      <div
        className="rounded-lg p-3 sm:p-4 mb-4 flex items-start sm:items-center gap-3 flex-wrap sm:flex-nowrap"
        style={{
          background: '#FFF7D6',
          border: `2px solid ${GOLD}`,
          boxShadow: `0 2px 0 ${NAVY}1A`,
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-sm sm:text-base tracking-wide" style={{ color: NAVY }}>
            You&apos;re viewing our in-stock menu
          </div>
          <div className="text-sm mt-0.5" style={{ color: '#5A4A14' }}>
            This order is set to the items we keep in deep stock. You can
            still browse the full menu — we&apos;ll confirm availability
            after you order.
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg px-3 py-2 text-sm font-bold tracking-wide whitespace-nowrap transition-transform hover:scale-[1.02]"
          style={{
            background: '#FFFFFF',
            color: NAVY,
            border: `2px solid ${NAVY}`,
            boxShadow: `0 2px 0 ${NAVY}`,
          }}
        >
          Show full menu →
        </button>
      </div>
    );
  }

  // Full-menu override — soft note about availability.
  return (
    <div
      className="rounded-lg p-3 sm:p-4 mb-4 flex items-start sm:items-center gap-3 flex-wrap sm:flex-nowrap"
      style={{
        background: '#F4F4F4',
        border: `1.5px solid #C8C8C8`,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-sm sm:text-base tracking-wide" style={{ color: NAVY }}>
          Browsing the full menu
        </div>
        <div className="text-sm mt-0.5 text-gray-700">
          Add anything you want. We&apos;ll confirm what&apos;s in stock and
          text you after purchase if a substitution is needed.
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg px-3 py-2 text-sm font-bold tracking-wide whitespace-nowrap transition-transform hover:scale-[1.02]"
        style={{
          background: GOLD,
          color: NAVY,
          border: `2px solid ${NAVY}`,
          boxShadow: `0 2px 0 ${NAVY}`,
        }}
      >
        ← Back to in-stock menu
      </button>
    </div>
  );
}
