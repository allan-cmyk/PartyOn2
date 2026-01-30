'use client';

import { useState, FormEvent, ReactElement } from 'react';
import { joinGroupOrderV2 } from '@/lib/group-orders-v2/api-client';
import type { GroupOrderV2Full } from '@/lib/group-orders-v2/types';

interface Props {
  groupOrder: GroupOrderV2Full;
  onJoined: (participantId: string) => void;
}

export default function JoinGroupForm({ groupOrder, onJoined }: Props): ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const participant = await joinGroupOrderV2(groupOrder.shareCode, {
        guestName: name,
        guestEmail: email,
        ageVerified: true,
      });
      onJoined(participant.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          placeholder="your@email.com"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="age-verify"
          required
          checked={ageVerified}
          onChange={(e) => setAgeVerified(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
        />
        <label htmlFor="age-verify" className="text-sm text-gray-600">
          I confirm I am 21 years of age or older. Valid ID will be required at
          delivery.
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !ageVerified}
        className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Joining...' : 'Join Group Order'}
      </button>
    </form>
  );
}
