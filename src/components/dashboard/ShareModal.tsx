'use client';

import { useState, type ReactElement } from 'react';

interface Props {
  shareCode: string;
  onClose: () => void;
}

export default function ShareModal({ shareCode, onClose }: Props): ReactElement {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/${shareCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-1">
          Share This Order
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          Send this link to friends so they can add their own items.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 select-all"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-brand-blue text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
