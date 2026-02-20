'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import { joinGroupOrderV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  orderName: string;
  hostName: string;
  isLocked?: boolean;
  onJoined: (participantId: string) => void;
}

export default function JoinOverlay({
  shareCode,
  orderName,
  hostName,
  isLocked,
  onJoined,
}: Props): ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!ageVerified) {
      setError('You must confirm you are 21 or older.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const participant = await joinGroupOrderV2(shareCode, {
        guestName: trimmedName,
        guestEmail: trimmedEmail,
        ageVerified: true,
      });
      onJoined(participant.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to join. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/pod-logo-2025.svg"
            alt="Party On"
            width={130}
            height={40}
            className="h-9 w-auto"
          />
        </div>

        <h1 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-1">
          You&apos;ve been invited to
        </h1>
        <p className="text-lg font-semibold text-yellow-600 text-center mb-1">
          {orderName}
        </p>
        <p className="text-sm text-gray-500 text-center mb-6">
          Hosted by {hostName}
        </p>

        {isLocked ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">This order is closed</p>
            <p className="text-xs text-gray-500">The host has locked this order. No new participants can join.</p>
          </div>
        ) : (
        <>
        <div className="space-y-3">
          <div>
            <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="join-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="join-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="join-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
              disabled={loading}
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ageVerified}
              onChange={(e) => setAgeVerified(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">
              I confirm I am 21 years of age or older
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="mt-5 w-full py-3 bg-brand-yellow text-gray-900 font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Order'}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
