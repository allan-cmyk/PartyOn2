'use client';

/**
 * PARTY ON DELIVERY CHAT
 *
 * Floating chat-bubble in the bottom-right corner. Same idea as the
 * Premier Party Cruises V2 site's chatbot — light conversational
 * tone, fast collection of qualifying answers via buttons + slider +
 * date-picker, ends with a personalized drink-order recommendation.
 *
 * Steps:
 *   1. Party type           — button grid (single select)
 *   2. Date of event        — date picker (defaults to today+7)
 *   3. # of people          — slider 4–100
 *   4. Contact info         — name / email / phone
 *   5. Recommendation       — top picks based on party type + headcount,
 *                             with CTAs to open the package builder or
 *                             go to the matching landing page
 *
 * All submissions create a Lead via POST /api/v1/chat/submit (same
 * downstream behavior as the /event-quiz quiz endpoint — appears in
 * Brian's Stuff → Leads with metadata.chatQuiz). The date picker starts at
 * the first day with a delivery window 24+ hours out (ADR-0010); a date
 * inside that minimum comes back refused with the call/text message.
 */
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  PARTY_TYPE_LABEL,
  type PartyType,
} from '@/lib/eventQuiz/routing';
import { sendLeadEvent } from '@/lib/leads/client';
import { getAttribution } from '@/lib/analytics/attribution';
import {
  DELIVERY_TOO_SOON_CODE,
  RUSH_NOTE,
  earliestQuoteDay,
} from '@/lib/delivery/lead-time';

type RecommendedItem = {
  handle: string;
  name: string;
  image?: string;
  price: number;
  qty: number;
};
type Recommendation = {
  occasion: string;
  packageName: string;
  packageBlurb: string;
  packageServes: string;
  packageImage: string;
  items: RecommendedItem[];
  estimatedTotal: number;
  missingHandles: string[];
};

type Step = 'party' | 'date' | 'headcount' | 'contact' | 'results';

const PARTY_OPTIONS: PartyType[] = [
  'just-deliver',
  'bachelor',
  'bachelorette',
  'corporate',
  'wedding',
  'boat',
  'house',
  'hotel',
];

const NAVY = '#0A1F33';
const GOLD = '#F2D34F';

interface PartyChatProps {
  /**
   * When provided, the parent owns open/close (e.g. the site-wide WidgetMenu
   * opening the quiz behind its "Get a party recommendation" door). When
   * omitted, PartyChat renders its own floating bubble and manages its own
   * open state — the original standalone behavior.
   */
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PartyChat({ isOpen: controlledIsOpen, onClose }: PartyChatProps = {}) {
  const isControlled = controlledIsOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? Boolean(controlledIsOpen) : internalOpen;
  // Closing routes to the parent when controlled (WidgetMenu treats this as
  // "back to the three-door menu"); otherwise it collapses back to the FAB.
  const closePanel = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };
  const [step, setStep] = useState<Step>('party');
  const [partyType, setPartyType] = useState<PartyType | null>(null);
  // Default the event a week out. The picker's minimum is the first day that
  // still has a delivery window 24+ hours away (ADR-0010), with an hour of
  // slack for finishing the chat — the server refuses anything sooner.
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const minDate = earliestQuoteDay();
  const [headcount, setHeadcount] = useState<number>(12);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  // True when the server refused the date as inside the 24-hour minimum —
  // the error box then offers a way back to the date step.
  const [dateRefused, setDateRefused] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Reset everything when the user closes the panel without finishing.
  // Skips reset if they completed (kept the recommendation visible if
  // re-opened the same session).
  useEffect(() => {
    if (!open && step !== 'results') {
      setStep('party');
      setError(null);
    }
  }, [open, step]);

  const choosePartyType = (p: PartyType) => {
    setPartyType(p);
    void sendLeadEvent({
      type: 'STEP_COMPLETE',
      widget: 'OTHER',
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      fieldName: 'chat_party_type',
      fieldValue: p,
      metadata: { flow: 'chat', step: 'party', partyType: p },
    });
    setStep('date');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyType || !firstName || !email) return;
    setError(null);
    setDateRefused(false);
    setSubmitting(true);
    try {
      // First call: build the recommendation so we can show the user
      // what's about to land in their dashboard.
      const recRes = await fetch('/api/v1/chat/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName,
          lastName: lastName || null,
          email,
          phone: phone || null,
          partyType,
          headcount,
          deliveryDate,
          // First-touch UTM + ad click ids — lets the Lead be tied to
          // the ad campaign that brought them in.
          attribution: getAttribution(),
        }),
      });
      const recJson = await recRes.json();
      if (!recRes.ok || !recJson.ok) {
        setDateRefused(recJson.code === DELIVERY_TOO_SOON_CODE);
        throw new Error(recJson.error || 'Could not save your info.');
      }
      setRecommendation(recJson.recommendation ?? null);
      setRedirectTo(recJson.redirectTo ?? null);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Fires when the user clicks the final CTA on the results step.
   * Calls /api/v1/quote/start to create a real dashboard with the
   * recommended items pre-loaded, stashes the host's participantId in
   * localStorage (so the dashboard recognizes them as host), and
   * hard-redirects to /dashboard/<shareCode>.
   */
  const [openingDashboard, setOpeningDashboard] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const openDashboard = async () => {
    if (!partyType || !firstName || !email) return;
    setOpenError(null);
    setOpeningDashboard(true);
    try {
      const res = await fetch('/api/v1/quote/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName,
          lastName: lastName || null,
          email,
          phone: phone || null,
          partyType,
          headcount,
          deliveryDate,
          source: 'chat',
          recommendedItems:
            recommendation?.items.map((it) => ({ handle: it.handle, qty: it.qty })) ?? [],
          attribution: getAttribution(),
        }),
      });
      const json = await res.json();
      if (json.code === DELIVERY_TOO_SOON_CODE) {
        // The date slipped inside the 24-hour minimum while the chat sat
        // open. No dashboard was created — show the call/text message.
        setOpenError(json.error ?? null);
        setOpeningDashboard(false);
        return;
      }
      if (!json.ok || !json.shareCode) {
        // Fallback: just take them to the matching landing page.
        window.location.href = json.redirectTo ?? '/';
        return;
      }
      // Mark host so the dashboard treats them as the order owner.
      try {
        if (json.hostParticipantId) {
          localStorage.setItem(
            `dashboard_participant_${json.shareCode}`,
            json.hostParticipantId,
          );
        }
      } catch {
        /* localStorage disabled */
      }
      window.location.href = json.redirectTo;
    } catch (err) {
      console.warn('[chat] quote/start failed', err);
      setOpeningDashboard(false);
    }
  };

  // Back to the date step after a refusal; the contact details stay filled in.
  const changeDate = () => {
    setError(null);
    setDateRefused(false);
    setOpenError(null);
    setStep('date');
  };

  // FAB (closed state) — suppressed when a parent controls the panel (the
  // parent renders its own launcher and simply toggles isOpen).
  if (!open) {
    if (isControlled) return null;
    return (
      <button
        onClick={() => setInternalOpen(true)}
        aria-label="Chat with Party On Delivery"
        className="fixed z-[150] rounded-full shadow-2xl transition-transform hover:scale-[1.05]"
        style={{
          right: 20,
          bottom: 20,
          width: 64,
          height: 64,
          background: GOLD,
          color: NAVY,
          border: `3px solid ${NAVY}`,
          boxShadow: `0 6px 0 ${NAVY}, 0 12px 24px rgba(0,0,0,0.25)`,
        }}
      >
        <span className="text-3xl leading-none" role="img" aria-label="party">
          🥂
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed z-[150] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
      style={{
        right: 20,
        bottom: 20,
        width: 'min(420px, calc(100vw - 40px))',
        height: 'min(640px, calc(100vh - 100px))',
        background: '#FFFFFF',
        border: `2px solid ${NAVY}`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-3"
        style={{ background: NAVY, color: '#FFFFFF', borderBottom: `3px solid ${GOLD}` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: GOLD, color: NAVY }}
          >
            🥂
          </div>
          <div className="min-w-0">
            <div className="font-heading text-base font-bold leading-tight tracking-wide">
              Party On Delivery
            </div>
            <div className="text-[11px] opacity-80 leading-tight">
              Plan your party in 30 seconds
            </div>
          </div>
        </div>
        <button
          onClick={closePanel}
          aria-label={isControlled ? 'Back to menu' : 'Close'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
        >
          {isControlled ? '‹' : '×'}
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {step === 'party' && (
          // Step 1 escapes the ChatBubble wrapper so the buttons can
          // fill the full chat width — feels less like a chat dropdown
          // and more like a real selection screen.
          <div className="flex flex-col h-full">
            <div className="text-sm text-gray-700 mb-3 leading-snug">
              Hey 👋 — what kind of party are you planning?
            </div>

            {/* Primary CTA — big yellow "ORDER DRINKS NOW" headline. */}
            <button
              type="button"
              onClick={() => choosePartyType('just-deliver')}
              className="w-full rounded-lg py-4 px-3 font-heading font-bold tracking-wider transition-transform hover:scale-[1.01]"
              style={{
                background: GOLD,
                color: NAVY,
                border: `3px solid ${NAVY}`,
                boxShadow: `0 5px 0 ${NAVY}, 0 8px 18px rgba(10,15,25,0.2)`,
                fontSize: '1.25rem',
              }}
            >
              ⚡ ORDER DRINKS NOW
            </button>

            <div className="text-center text-[10px] uppercase tracking-widest text-gray-500 my-3 font-bold">
              — or pick your occasion —
            </div>

            {/* 7 occasion buttons, single column, each tall enough to
                feel tappable on mobile. The chat panel is ~420px wide
                so a single column keeps the labels readable. */}
            <div className="flex flex-col gap-2 flex-1">
              {PARTY_OPTIONS.filter((p) => p !== 'just-deliver').map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => choosePartyType(p)}
                  className="w-full text-left px-4 py-3 rounded-lg font-bold transition-transform hover:scale-[1.01]"
                  style={{
                    background: '#FFFFFF',
                    color: NAVY,
                    border: `2px solid ${NAVY}`,
                    boxShadow: `0 3px 0 ${NAVY}`,
                    fontSize: '0.95rem',
                  }}
                >
                  {PARTY_TYPE_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'date' && (
          <>
            {partyType && (
              <ChatBubble
                from="user"
                content={PARTY_TYPE_LABEL[partyType]}
              />
            )}
            <ChatBubble
              from="bot"
              content={
                <>
                  <div className="mb-3">
                    Got it. When&apos;s the event?
                  </div>
                  <input
                    type="date"
                    value={deliveryDate}
                    min={minDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full rounded-md border-2 px-3 py-2 text-sm font-bold"
                    style={{ borderColor: NAVY, color: NAVY }}
                  />
                  <div className="mt-2 text-sm text-gray-700">{RUSH_NOTE}</div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setStep('headcount')}
                      className="px-4 py-2 rounded-md font-bold text-xs tracking-widest"
                      style={{
                        background: GOLD,
                        color: NAVY,
                        border: `2px solid ${NAVY}`,
                      }}
                    >
                      NEXT →
                    </button>
                  </div>
                </>
              }
            />
          </>
        )}

        {step === 'headcount' && (
          <>
            <ChatBubble from="user" content={prettyDate(deliveryDate)} />
            <ChatBubble
              from="bot"
              content={
                <>
                  <div className="mb-3">
                    How many drinkers? Slide to dial it in.
                  </div>
                  <div className="text-center mb-2">
                    <span
                      className="font-heading text-4xl font-bold"
                      style={{ color: NAVY }}
                    >
                      {headcount}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">people</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={100}
                    step={1}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: GOLD }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>4</span>
                    <span>100</span>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => setStep('contact')}
                      className="px-4 py-2 rounded-md font-bold text-xs tracking-widest"
                      style={{
                        background: GOLD,
                        color: NAVY,
                        border: `2px solid ${NAVY}`,
                      }}
                    >
                      NEXT →
                    </button>
                  </div>
                </>
              }
            />
          </>
        )}

        {step === 'contact' && (
          <>
            <ChatBubble
              from="user"
              content={`${headcount} people · ${prettyDate(deliveryDate)}`}
            />
            <ChatBubble
              from="bot"
              content={
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  data-lead-capture="manual"
                  data-lead-widget="CONTACT_FORM"
                  className="space-y-2"
                >
                  <div className="mb-2">
                    Last bit — drop your info and I&apos;ll build your
                    recommendation:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ChatInput
                      label="First name"
                      value={firstName}
                      onChange={setFirstName}
                      required
                    />
                    <ChatInput
                      label="Last name"
                      value={lastName}
                      onChange={setLastName}
                    />
                  </div>
                  <ChatInput
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={setEmail}
                  />
                  <ChatInput
                    label="Phone"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                  />
                  {error && (
                    <div
                      className="rounded-md p-2 text-sm"
                      style={{ background: '#FEE2E2', color: '#991B1B' }}
                    >
                      {error}
                      {dateRefused && (
                        <button
                          type="button"
                          onClick={changeDate}
                          className="block mt-1.5 font-bold underline"
                        >
                          Pick a different date
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !firstName || !email}
                    className="w-full py-3 rounded-md font-bold text-sm tracking-widest disabled:opacity-40 mt-2"
                    style={{
                      background: GOLD,
                      color: NAVY,
                      border: `2px solid ${NAVY}`,
                      boxShadow: `0 3px 0 ${NAVY}`,
                    }}
                  >
                    {submitting ? 'BUILDING…' : 'SHOW MY DRINKS →'}
                  </button>
                </form>
              }
            />
          </>
        )}

        {step === 'results' && recommendation && (
          <ResultsView
            firstName={firstName}
            recommendation={recommendation}
            redirectTo={redirectTo ?? '/'}
            headcount={headcount}
            deliveryDate={deliveryDate}
            onOpenDashboard={openDashboard}
            opening={openingDashboard}
            openError={openError}
            onChangeDate={changeDate}
          />
        )}

        {step === 'results' && !recommendation && (
          <ChatBubble
            from="bot"
            content={
              <>
                <div className="mb-3">
                  You&apos;re all set, {firstName} 🎉 — I&apos;ll email you
                  the full menu and details. Head over to the order page
                  to start your drink list:
                </div>
                <a
                  href={redirectTo ?? '/'}
                  className="inline-block w-full text-center py-2.5 rounded-md font-bold text-xs tracking-widest"
                  style={{
                    background: GOLD,
                    color: NAVY,
                    border: `2px solid ${NAVY}`,
                    boxShadow: `0 3px 0 ${NAVY}`,
                  }}
                >
                  OPEN MY MENU →
                </a>
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

/**
 * Final view inside the chat — recommended order at the top, with a CTA
 * below that creates the customer's dashboard with these items pre-loaded.
 */
function ResultsView({
  firstName,
  recommendation,
  headcount,
  deliveryDate,
  onOpenDashboard,
  opening,
  openError,
  onChangeDate,
}: {
  firstName: string;
  recommendation: Recommendation;
  /** Kept for backwards compat; not used now that the CTA creates a dashboard. */
  redirectTo: string;
  headcount: number;
  deliveryDate: string;
  onOpenDashboard: () => void;
  opening: boolean;
  /** Refusal message when quote/start turned the date away. */
  openError: string | null;
  onChangeDate: () => void;
}) {
  return (
    <div className="space-y-3">
      <ChatBubble
        from="bot"
        content={
          <>
            Built it — {firstName}, here&apos;s what I&apos;d order for{' '}
            <strong>{headcount} people</strong> on{' '}
            <strong>{prettyDate(deliveryDate)}</strong>:
          </>
        }
      />

      {/* Recommendation card */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: `2px solid ${NAVY}` }}
      >
        <div
          className="px-3 py-2"
          style={{ background: NAVY, color: '#FFFFFF' }}
        >
          <div className="text-[10px] font-bold tracking-widest" style={{ color: GOLD }}>
            YOUR RECOMMENDED ORDER
          </div>
          <div className="font-heading text-base font-bold leading-tight">
            {recommendation.packageName}
          </div>
          <div className="text-[11px] opacity-80">{recommendation.packageServes}</div>
        </div>
        <div className="bg-white px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
          {recommendation.items.map((it) => (
            <div key={it.handle} className="flex items-center gap-2">
              <div
                className="relative w-10 h-10 flex-shrink-0 rounded bg-gray-50"
                style={{ border: '1px solid #E5E7EB' }}
              >
                {it.image && (
                  <Image
                    src={it.image}
                    alt={it.name}
                    fill
                    className="object-contain p-0.5"
                    sizes="40px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-xs font-bold leading-tight truncate"
                  style={{ color: NAVY }}
                >
                  {it.qty}× {it.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  ${(it.price * it.qty).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          className="px-3 py-2 flex items-center justify-between"
          style={{ background: '#FAF6EE', borderTop: '1px solid #E5E7EB' }}
        >
          <span className="text-xs font-bold" style={{ color: NAVY }}>
            Subtotal
          </span>
          <span className="font-heading text-lg font-bold" style={{ color: NAVY }}>
            ${recommendation.estimatedTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* CTA — creates a real dashboard with these items pre-loaded and
          redirects there. From the dashboard the customer can browse the
          full menu, add more, share with their group, split-pay, etc. */}
      <button
        type="button"
        onClick={onOpenDashboard}
        disabled={opening}
        className="block w-full text-center py-3 rounded-md font-bold text-sm tracking-widest disabled:opacity-60"
        style={{
          background: GOLD,
          color: NAVY,
          border: `3px solid ${NAVY}`,
          boxShadow: `0 4px 0 ${NAVY}`,
        }}
      >
        {opening
          ? 'BUILDING YOUR ORDER…'
          : 'OPEN MY ORDER + ADD MORE ITEMS →'}
      </button>
      {openError && (
        <div
          role="alert"
          className="rounded-md p-2 text-sm"
          style={{ background: '#FEE2E2', color: '#991B1B' }}
        >
          {openError}
          <button
            type="button"
            onClick={onChangeDate}
            className="block mt-1.5 font-bold underline"
          >
            Pick a different date
          </button>
        </div>
      )}
      <p className="text-[10px] text-gray-500 text-center">
        These items will be in your cart. You can edit, add more from the full
        menu, or share with your group from the order page.
      </p>
    </div>
  );
}

// ─── Small subcomponents ──────────────────────────────────────────────

function ChatBubble({
  from,
  content,
}: {
  from: 'bot' | 'user';
  content: React.ReactNode;
}) {
  const isBot = from === 'bot';
  return (
    <div className={`flex mb-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className="rounded-2xl px-3 py-2 max-w-[85%] text-sm leading-snug"
        style={{
          background: isBot ? '#FFFFFF' : GOLD,
          color: NAVY,
          border: isBot ? '1.5px solid #E5E7EB' : `2px solid ${NAVY}`,
          borderTopLeftRadius: isBot ? 4 : undefined,
          borderTopRightRadius: !isBot ? 4 : undefined,
        }}
      >
        {content}
      </div>
    </div>
  );
}

function ChatInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-[9px] font-bold tracking-widest mb-0.5"
        style={{ color: '#6B7280' }}
      >
        {label.toUpperCase()}
        {required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md px-2.5 py-2 text-sm border border-gray-200 focus:outline-none focus:border-blue-500"
        style={{ color: NAVY }}
      />
    </div>
  );
}

function prettyDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
