'use client';

/**
 * Email/phone capture form for /partners/<slug>/welcome.
 *
 * Posts to POST /api/v1/partner-lead. Attribution comes from the ref_code
 * cookie that middleware sets automatically when the customer visits this
 * page (the /partners/<slug> route triggers the cookie).
 *
 * On success: replaces the form with a confirmation card. Doesn't redirect
 * — staying on the same URL keeps the visitor anchored and gives our pixel
 * a chance to record the conversion event.
 */

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';

interface Props {
  partnerSlug: string;
  partnerName: string;
  perk: string;
}

interface UtmBag {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
}

function readUtmsFromUrl(): UtmBag {
  if (typeof window === 'undefined') {
    return { source: null, medium: null, campaign: null, content: null, term: null };
  }
  const sp = new URLSearchParams(window.location.search);
  return {
    source: sp.get('utm_source'),
    medium: sp.get('utm_medium'),
    campaign: sp.get('utm_campaign'),
    content: sp.get('utm_content'),
    term: sp.get('utm_term'),
  };
}

export default function WelcomeForm({ partnerSlug, partnerName, perk }: Props) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [utm, setUtm] = useState<UtmBag>({
    source: null,
    medium: null,
    campaign: null,
    content: null,
    term: null,
  });

  // Capture UTMs from URL on mount — once they're in state they survive any
  // navigation Next does on submit.
  useEffect(() => {
    setUtm(readUtmsFromUrl());
  }, []);

  // Heuristic: when utm_medium === 'confirmation_email', the customer
  // arrived from a partner's booking-confirmation CTA. This flag flips the
  // sourceWidget on the backend so GHL can route them to a different SMS
  // template (warmer, references the booking).
  const cameFromConfirmationEmail = utm.medium === 'confirmation_email';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email && !phone) {
      setError('Please enter an email or phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/partner-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim() || null,
          phone: phone.trim() || null,
          firstName: firstName.trim() || null,
          cameFromConfirmationEmail,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : null,
          utm,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = typeof data.reason === 'string' ? data.reason : 'Something went wrong.';
        setError(detail);
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-6"
        role="status"
        aria-live="polite"
      >
        <h3 className="font-heading tracking-[0.08em] text-2xl text-gray-900 uppercase">
          You&apos;re in.
        </h3>
        <p className="mt-2 text-base text-gray-700">
          We just texted you a link to your delivery dashboard. {perk} on orders of $150+,
          courtesy of {partnerName}.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Didn&apos;t get a text? Check your email or refresh this page to try again.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="welcome-firstName" className="block text-base font-semibold text-gray-900 mb-1">
          First name <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          id="welcome-firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input-premium"
          placeholder="Alex"
        />
      </div>

      <div>
        <label htmlFor="welcome-phone" className="block text-base font-semibold text-gray-900 mb-1">
          Phone number
        </label>
        <input
          id="welcome-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-premium"
          placeholder="(512) 555-0100"
        />
      </div>

      <div>
        <label htmlFor="welcome-email" className="block text-base font-semibold text-gray-900 mb-1">
          Email <span className="text-gray-500 font-normal">(if you&apos;d rather we email)</span>
        </label>
        <input
          id="welcome-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-premium"
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-cart w-full disabled:opacity-60 disabled:cursor-not-allowed"
        data-partner-slug={partnerSlug}
      >
        {submitting ? 'Sending…' : 'Text me my delivery link'}
      </button>

      {/* TCPA-required consent text — explicit opt-in for marketing SMS. */}
      <p className="text-xs text-gray-600 leading-relaxed">
        By submitting, you agree to receive marketing SMS and email from Party On
        Delivery. Msg &amp; data rates may apply. Msg frequency varies. Reply
        STOP to unsubscribe. See our{' '}
        <Link href="/privacy" className="underline">Privacy Policy</Link> and{' '}
        <Link href="/terms" className="underline">Terms</Link>.
      </p>
    </form>
  );
}
