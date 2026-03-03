'use client';

import { useState, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateLoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // No password entered -- send magic link directly
    if (!password.trim()) {
      await sendMagicLink();
      return;
    }

    try {
      const res = await fetch('/api/v1/affiliate/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(data.redirect || '/affiliate/dashboard');
        return;
      }

      if (data.error === 'NO_PASSWORD_SET') {
        await sendMagicLink();
        setError('No password set yet. We sent you a login link -- once logged in you can set a password from the dashboard.');
        return;
      }

      setError(data.error || 'Invalid email or password');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendMagicLink = async () => {
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
        setMagicLinkSent(true);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMagicLink();
  };

  if (magicLinkSent) {
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
            onClick={() => { setMagicLinkSent(false); setShowMagicLink(false); setEmail(''); setPassword(''); }}
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
          <p className="text-gray-500 text-sm mt-1">
            {showMagicLink ? 'Enter your email to receive a login link' : 'Sign in with your email and password, or leave password blank for a login link'}
          </p>
        </div>

        {showMagicLink ? (
          <form onSubmit={handleMagicLinkSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
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

            <button
              type="button"
              onClick={() => { setShowMagicLink(false); setError(''); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Back to password login
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="bg-white rounded-lg shadow-md p-6 space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave blank to get a login link"
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
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => { setShowMagicLink(true); setError(''); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Forgot password? Sign in with email link
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Not a partner yet? <Link href="/affiliate/apply" className="text-blue-600 hover:text-blue-800">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
