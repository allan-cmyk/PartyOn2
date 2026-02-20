'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import { joinGroupOrderV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  orderName: string;
  hostName: string;
  onJoined: (participantId: string) => void;
}

export default function JoinOverlay({
  shareCode,
  orderName,
  hostName,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/partyon-logo.png"
            alt="Party On"
            width={120}
            height={38}
            className="h-9 w-auto"
          />
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
          You&apos;ve been invited to
        </h1>
        <p className="text-lg font-semibold text-yellow-600 text-center mb-1">
          {orderName}
        </p>
        <p className="text-sm text-gray-500 text-center mb-6">
          Hosted by {hostName}
        </p>

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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              disabled={loading}
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ageVerified}
              onChange={(e) => setAgeVerified(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
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
          className="mt-5 w-full py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Order'}
        </button>
      </div>
    </div>
  );
}
