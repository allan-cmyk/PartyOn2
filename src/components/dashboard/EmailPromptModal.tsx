'use client';

import { useState, type ReactElement } from 'react';

interface Props {
  participantName: string;
  onSubmit: (email: string) => void;
  onClose: () => void;
}

export default function EmailPromptModal({
  participantName,
  onSubmit,
  onClose,
}: Props): ReactElement {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-5">
        <h2 className="text-base font-heading font-bold tracking-[0.08em] text-gray-900 mb-1">
          Before you add items
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Hey {participantName}, we just need your email so we can reach you about your order.
        </p>

        <div>
          <label htmlFor="email-prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email-prompt"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-brand-yellow text-gray-900 font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
