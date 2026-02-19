'use client';

import { useState, ReactElement } from 'react';
import Link from 'next/link';

export default function AffiliateLoginPage(): ReactElement {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/affiliate/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-2">
            If an active partner account exists for <strong>{email}</strong>, we sent a login link.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            The link expires in 15 minutes. Check your spam folder if you don&apos;t see it.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">Party On</Link>
          <h1 className="text-xl font-semibold text-gray-800 mt-4">Partner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a login link</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Sending...' : 'Send Login Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Not a partner yet? <Link href="/affiliate/apply" className="text-blue-600 hover:text-blue-800">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
