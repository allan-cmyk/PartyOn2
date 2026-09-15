'use client';

/**
 * Tells dashboard guests when online checkout closes for a delivery — the tab
 * checkout routes refuse payment inside 24 hours of the window (ADR-0010).
 *
 *   - CLOSING: the cutoff is within the next day → "Online ordering for this
 *     delivery closes Wed, 8:30 PM CDT — 24 hours before delivery."
 *   - CLOSED: the window starts in under 24 hours → the dashboard refusal
 *     message with (737) 371-9700. A host on a tab with nothing paid yet also
 *     gets a shortcut to push the delivery later; the tab PATCH route allows
 *     moving an inside-24h window later, never sooner.
 *
 * Renders nothing when the date isn't confirmed, the window has started, the
 * order or tab is finished, or everything on the tab is already paid for.
 */
import type { ReactElement } from 'react';
import type { GroupOrderV2Status, SubOrderFull } from '@/lib/group-orders-v2/types';
import {
  DASHBOARD_LEAD_TIME_MESSAGE,
  MINIMUM_LEAD_TIME_HOURS,
  deliveryWindowStartUtc,
} from '@/lib/delivery/lead-time';

const MINIMUM_MS = MINIMUM_LEAD_TIME_HOURS * 60 * 60 * 1000;

const CUTOFF_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Chicago',
  // Guests often aren't in Austin: "8:30 PM CDT", not a bare "8:30 PM".
  timeZoneName: 'short',
});

type ScheduleFields = Pick<SubOrderFull, 'deliveryDate' | 'deliveryDateConfirmed' | 'deliveryTime'>;

type NoticeTab = ScheduleFields &
  Pick<SubOrderFull, 'status' | 'draftItems' | 'purchasedItems'>;

/** Where a tab's delivery sits relative to the online checkout cutoff. */
export type LeadTimeState = 'closing' | 'closed' | null;

interface Props {
  tab: NoticeTab;
  groupStatus: GroupOrderV2Status;
  /** Opens the delivery-details editor. Pass only when this viewer can edit the tab. */
  onChangeDelivery?: () => void;
  /** Injectable clock for tests. */
  now?: Date;
}

/** When online checkout closes for this tab (24h before its window), or null without a confirmed date. */
export function checkoutCutoff(tab: ScheduleFields): Date | null {
  if (!tab.deliveryDateConfirmed || !tab.deliveryDate) return null;
  const start = deliveryWindowStartUtc(tab.deliveryDate, tab.deliveryTime);
  return start ? new Date(start.getTime() - MINIMUM_MS) : null;
}

/**
 * 'closed' inside 24 hours of the window, 'closing' when the cutoff is less
 * than a day away, otherwise null (including once the window has started).
 * Exactly 24 hours out still counts as open, matching meetsLeadTime.
 */
export function leadTimeState(tab: ScheduleFields, now: Date = new Date()): LeadTimeState {
  const cutoff = checkoutCutoff(tab);
  if (!cutoff) return null;
  const toCutoff = cutoff.getTime() - now.getTime();
  if (toCutoff + MINIMUM_MS <= 0) return null;
  if (toCutoff < 0) return 'closed';
  if (toCutoff < MINIMUM_MS) return 'closing';
  return null;
}

/** Dashboard notice for a tab nearing or past the online checkout cutoff. */
export default function LeadTimeNotice({
  tab,
  groupStatus,
  onChangeDelivery,
  now = new Date(),
}: Props): ReactElement | null {
  if (groupStatus !== 'ACTIVE') return null;
  if (tab.status !== 'OPEN' && tab.status !== 'LOCKED') return null;
  const hasPurchases = tab.purchasedItems.length > 0;
  // Everything on the tab is paid for: the order is set, and "ordering
  // closes" would only alarm the customer.
  if (hasPurchases && tab.draftItems.length === 0) return null;

  const state = leadTimeState(tab, now);
  const cutoff = checkoutCutoff(tab);
  if (!state || !cutoff) return null;

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
        {state === 'closing' ? (
          <p className="text-sm text-gray-900">
            Online ordering for this delivery closes {CUTOFF_FORMAT.format(cutoff)} —{' '}
            {MINIMUM_LEAD_TIME_HOURS} hours before delivery.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-900">{DASHBOARD_LEAD_TIME_MESSAGE}</p>
            {/* Never on a tab with purchases: moving a paid delivery must go
                through ops, not a self-serve date change. */}
            {onChangeDelivery && !hasPurchases && (
              <button
                type="button"
                onClick={onChangeDelivery}
                className="mt-1 text-sm font-semibold text-brand-blue underline"
              >
                Move this delivery to a later time
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
