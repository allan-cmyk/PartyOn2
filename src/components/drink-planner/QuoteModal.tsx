'use client';

import { useState } from 'react';
import type { QuizResults } from '@/lib/drinkPlannerTypes';

interface QuoteModalProps {
  results: QuizResults;
  onClose: () => void;
}

export default function QuoteModal({ results, onClose }: QuoteModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email && !phone) {
      setError('Please enter an email or phone number');
      return;
    }
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/v1/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          results,
        }),
      });

      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-brand-yellow mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl text-white font-medium mb-2">Quote Sent!</h3>
            <p className="text-gray-400 text-sm">Check your inbox for your personalized drink plan.</p>
            <button
              onClick={onClose}
              className="mt-6 text-brand-yellow hover:text-yellow-400 text-sm tracking-[0.08em]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg text-white font-medium tracking-[0.05em]">
                Send Me This Quote
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 tracking-[0.1em] uppercase mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 tracking-[0.1em] uppercase mb-1.5">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(512) 555-1234"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs mb-4">{error}</p>
            )}

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-brand-yellow text-gray-900 font-semibold py-3 rounded-full tracking-[0.08em] hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'SEND QUOTE'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
