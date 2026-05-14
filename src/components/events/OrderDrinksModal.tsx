'use client';

/**
 * EVENT BYOB ORDER MODAL
 *
 * Pop-up that opens after an invitee RSVPs. Shows the organizer's curated
 * drink list (or full catalog placeholder) and lets the invitee:
 *   - Pick quantities of each item
 *   - See running total in the sticky footer
 *   - Submit → mockup confirmation screen (real version → Stripe checkout
 *     with separate-bill grouping by RSVP name)
 *
 * Visually mirrors QuickBuyModal so the experience feels consistent across
 * the partyondelivery.com domain.
 */
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLeadCapture } from '@/lib/leads/client';
import type { EventInvite } from '@/lib/events/types';
import type { EventColorTheme } from '@/lib/events/theme';

export type DrinkOption = {
  handle: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  unit?: string; // "750ml", "6-pack"
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  event: EventInvite;
  theme: EventColorTheme;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  /** Curated list resolved from event.drinks.curatedHandles. */
  options: DrinkOption[];
};

export default function OrderDrinksModal({
  open,
  onClose,
  event,
  theme,
  guestName,
  guestEmail,
  guestPhone,
  options,
}: Props) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lead = useLeadCapture({ widget: 'QUICK_BUY', page: `/events/${event.slug}` });

  // Reset on close so the next open is a fresh slate.
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [open]);

  const total = useMemo(() => {
    return options.reduce((sum, o) => sum + (qty[o.handle] ?? 0) * o.price, 0);
  }, [qty, options]);

  const itemCount = useMemo(
    () => Object.values(qty).reduce((s, n) => s + n, 0),
    [qty],
  );

  const bump = (handle: string, delta: number) => {
    setQty((q) => {
      const next = Math.max(0, (q[handle] ?? 0) + delta);
      return { ...q, [handle]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || itemCount === 0) return;
    setSubmitting(true);

    // Fire lead-capture event so the order intent shows up in /admin/brians-stuff?tab=leads.
    const lines = options
      .filter((o) => (qty[o.handle] ?? 0) > 0)
      .map((o) => ({ handle: o.handle, name: o.name, qty: qty[o.handle] ?? 0, unitPrice: o.price }));
    lead.onCheckoutStart(
      {
        firstName: guestName.split(' ')[0],
        lastName: guestName.split(' ').slice(1).join(' '),
        email: guestEmail,
        phone: guestPhone,
      },
      {
        eventSlug: event.slug,
        eventTitle: event.title,
        flow: 'event-byob',
        itemCount,
        total,
      },
      lines,
    );

    // Persist the mock order to sessionStorage so the success screen can render it.
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        `pod_event_order_${event.slug}`,
        JSON.stringify({
          lines,
          total,
          guestName,
          guestEmail,
          submittedAt: new Date().toISOString(),
        }),
      );
    }

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(10,15,25,0.78)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* HEADER */}
        <div
          className="px-5 py-4 flex items-start justify-between"
          style={{ background: theme.navy, color: '#FFFFFF' }}
        >
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-widest opacity-80">
              STEP 2 OF 2 · BYOB BAR
            </div>
            <div className="font-heading text-xl font-bold leading-tight mt-1 truncate">
              {submitted ? "You're all set, " : 'Order your drinks, '}
              <span style={{ color: theme.primary }}>{guestName.split(' ')[0]}</span>
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              Delivered to {event.venue} · {event.cityState}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>
        </div>

        {submitted ? (
          <SubmittedView
            event={event}
            theme={theme}
            itemCount={itemCount}
            total={total}
            onClose={onClose}
          />
        ) : (
          <>
            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div
                className="rounded-md p-3 mb-4 text-sm leading-snug"
                style={{ background: theme.cream, color: theme.navy, border: `1px solid ${theme.primary}55` }}
              >
                <div className="font-bold mb-0.5">{event.drinks.blurb}</div>
                {event.drinks.perPersonHint && (
                  <div className="text-xs opacity-80 mt-1">💡 {event.drinks.perPersonHint}</div>
                )}
                <div className="text-xs opacity-80 mt-1">
                  ✓ Free delivery to the venue · ✓ Separate bill — only you pay
                  for your stuff · ✓ Your name on the box
                </div>
              </div>

              <form id="event-order-form" onSubmit={handleSubmit} noValidate className="space-y-2.5">
                {options.length === 0 && (
                  <div className="rounded-md p-4 text-sm text-gray-600 bg-gray-50 border border-gray-200">
                    Organizer hasn&apos;t finalized the drink list yet — check back
                    closer to the party date.
                  </div>
                )}
                {options.map((o) => {
                  const n = qty[o.handle] ?? 0;
                  return (
                    <div
                      key={o.handle}
                      className="flex gap-3 items-center p-2 rounded-md border"
                      style={{
                        borderColor: n > 0 ? theme.primary : '#E5E7EB',
                        background: n > 0 ? `${theme.primary}11` : '#FFFFFF',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 relative"
                        style={{ background: '#F3F4F6' }}
                      >
                        {o.image ? (
                          <Image src={o.image} alt={o.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍸</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm leading-snug" style={{ color: theme.navy }}>
                          {o.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {o.unit ?? ''}
                          {o.unit && o.category ? ' · ' : ''}
                          {o.category ?? ''}
                        </div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: theme.navy }}>
                          ${o.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => bump(o.handle, -1)}
                          disabled={n === 0}
                          className="w-8 h-8 rounded-md font-bold disabled:opacity-30"
                          style={{ background: '#F3F4F6', color: theme.navy }}
                        >
                          −
                        </button>
                        <span
                          className="w-8 text-center font-bold text-sm"
                          style={{ color: theme.navy }}
                        >
                          {n}
                        </span>
                        <button
                          type="button"
                          onClick={() => bump(o.handle, 1)}
                          className="w-8 h-8 rounded-md font-bold"
                          style={{ background: theme.primary, color: theme.primaryText }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </form>
            </div>

            {/* STICKY FOOTER */}
            <div className="px-5 py-3 border-t bg-white" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {itemCount} item{itemCount === 1 ? '' : 's'} · Free delivery to venue
                </span>
                <span className="font-bold text-lg" style={{ color: theme.navy }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 rounded-md font-semibold text-sm"
                  style={{ background: '#F3F4F6', color: theme.navy }}
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  form="event-order-form"
                  disabled={submitting || itemCount === 0}
                  className="py-3 rounded-md font-bold text-sm tracking-wide transition-transform disabled:opacity-40 hover:scale-[1.01]"
                  style={{ background: theme.primary, color: theme.primaryText }}
                >
                  {submitting
                    ? 'Locking it in…'
                    : itemCount === 0
                      ? 'Pick at least one'
                      : `Continue to pay · $${total.toFixed(2)} →`}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Mockup mode — real version routes to secure Stripe checkout with your name on the box.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SubmittedView({
  event,
  theme,
  itemCount,
  total,
  onClose,
}: {
  event: EventInvite;
  theme: EventColorTheme;
  itemCount: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-8 text-center">
      <div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
        style={{ background: theme.primary, color: theme.primaryText }}
      >
        <span className="text-3xl">✓</span>
      </div>
      <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: theme.navy }}>
        Order locked in
      </h2>
      <p className="text-sm text-gray-700 mb-4 max-w-md mx-auto">
        Your {itemCount} item{itemCount === 1 ? '' : 's'} (${total.toFixed(2)}) will
        be delivered to <strong>{event.venue}</strong> with your name on the
        box, 30 min before doors open.
      </p>
      <div
        className="text-xs text-left rounded-md p-3 mb-4 max-w-md mx-auto"
        style={{ background: theme.cream, color: theme.navy }}
      >
        <div className="font-bold mb-1">What happens next:</div>
        <ol className="list-decimal pl-4 space-y-1">
          <li>You&apos;ll get a confirmation text from POD with delivery ETA.</li>
          <li>Your bottles arrive 30 min before showtime — boxed with your name.</li>
          <li>Want to add more? Reply to the confirmation text up to 24h before.</li>
        </ol>
      </div>
      <button
        onClick={onClose}
        className="px-6 py-3 rounded-md font-bold text-sm tracking-wide"
        style={{ background: theme.navy, color: '#FFFFFF' }}
      >
        Back to the invite →
      </button>
    </div>
  );
}
