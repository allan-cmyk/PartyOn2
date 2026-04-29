'use client';

import React, { useRef, useState } from 'react';

interface VacationRentalLeadCaptureProps {
  source?: string;
}

export default function VacationRentalLeadCapture({
  source = 'vacation-rental-event',
}: VacationRentalLeadCaptureProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formLoadedAt = useRef(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    if (!firstName.trim()) {
      setErrorMessage('First name is required.');
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email.');
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/partners/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: firstName.trim(),
          email: email.trim(),
          partnerType: 'Vacation Rental',
          source,
          submittedAt: new Date().toISOString(),
          _formLoadedAt: formLoadedAt.current,
          website_url: '',
          fax_number: '',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setStatus('success');
      setFirstName('');
      setEmail('');
    } catch (err) {
      console.error('Lead capture error:', err);
      setErrorMessage('Something went wrong. Try again or email allan@partyondelivery.com.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-brand-yellow text-navy rounded-lg px-6 py-5 max-w-2xl mx-auto text-center">
        <div className="font-heading text-2xl tracking-[0.05em]">
          You&apos;re on the list. See you tomorrow night.
        </div>
        <p className="text-sm mt-2 text-navy/80">
          We&apos;ll send the partner deck and cocktail menu to your inbox shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          required
          autoComplete="given-name"
          className="flex-1 px-5 py-4 bg-white/95 text-gray-900 placeholder-gray-500 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          autoComplete="email"
          className="flex-1 px-5 py-4 bg-white/95 text-gray-900 placeholder-gray-500 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-brand-yellow hover:bg-gold text-navy font-heading font-bold tracking-[0.08em] uppercase text-base px-8 py-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Adding…' : 'Send me the deck'}
        </button>
      </div>

      {/* Honeypot fields */}
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input type="text" name="fax_number" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {status === 'error' && (
        <p className="mt-3 text-sm text-brand-yellow text-center">{errorMessage}</p>
      )}

      <p className="mt-4 text-xs text-cream/60 text-center tracking-wide">
        We&apos;ll send the partner one-pager and a follow-up after the event. No spam.
      </p>
    </form>
  );
}
