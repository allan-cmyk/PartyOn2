'use client';

/**
 * Early heads-up that online checkout is closed for this delivery: its
 * window starts less than 24 hours from now (ADR-0010), so the tab checkout
 * routes will refuse payment. Saying so up front beats letting a guest build
 * a cart and hit the cutoff at the pay button.
 *
 * Renders nothing when the date isn't confirmed, the window has already
 * started (the "less than 24 hours away" wording would be false), or the
 * order or tab is finished. A host who can still edit the tab gets a shortcut
 * to push the delivery later — the tab PATCH route allows moving an
 * inside-24h window later, never sooner.
 */
import type { ReactElement } from 'react';
import type { GroupOrderV2Status, SubOrderFull } from '@/lib/group-orders-v2/types';
import {
  DASHBOARD_LEAD_TIME_MESSAGE,
  MINIMUM_LEAD_TIME_HOURS,
  deliveryWindowStartUtc,
} from '@/lib/delivery/lead-time';

type NoticeTab = Pick<
  SubOrderFull,
  'status' | 'deliveryDate' | 'deliveryDateConfirmed' | 'deliveryTime'
>;

interface Props {
  tab: NoticeTab;
  groupStatus: GroupOrderV2Status;
  /** Opens the delivery-details editor. Pass only when this viewer can edit the tab. */
  onChangeDelivery?: () => void;
  /** Injectable clock for tests. */
  now?: Date;
}

/** True when the tab's delivery window starts in the future but inside the 24-hour minimum. */
export function isInsideLeadTime(tab: NoticeTab, now: Date = new Date()): boolean {
  if (!tab.deliveryDateConfirmed || !tab.deliveryDate) return false;
  const start = deliveryWindowStartUtc(tab.deliveryDate, tab.deliveryTime);
  if (!start) return false;
  const msUntil = start.getTime() - now.getTime();
  return msUntil > 0 && msUntil < MINIMUM_LEAD_TIME_HOURS * 60 * 60 * 1000;
}

/** Dashboard notice shown while a tab's delivery is inside the 24-hour minimum. */
export default function LeadTimeNotice({
  tab,
  groupStatus,
  onChangeDelivery,
  now = new Date(),
}: Props): ReactElement | null {
  if (groupStatus !== 'ACTIVE') return null;
  if (tab.status !== 'OPEN' && tab.status !== 'LOCKED') return null;
  if (!isInsideLeadTime(tab, now)) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3"
    >
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2" />
      </svg>
      <div className="min-w-0">
        <p className="text-sm text-gray-900">{DASHBOARD_LEAD_TIME_MESSAGE}</p>
        {onChangeDelivery && (
          <button
            type="button"
            onClick={onChangeDelivery}
            className="mt-1 text-sm font-semibold text-brand-blue underline"
          >
            Move this delivery to a later time
          </button>
        )}
      </div>
    </div>
  );
}
