'use client';

import { useState, ReactElement } from 'react';

interface Props {
  shareCode: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareGroupModal({
  shareCode,
  groupName,
  isOpen,
  onClose,
}: Props): ReactElement | null {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/group-v2/${shareCode}`;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: select the text so user can Ctrl+C
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Share Group Order
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Share this code or link so others can join &ldquo;{groupName}&rdquo;.
        </p>

        {/* Share Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Share Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
              <span className="text-2xl font-mono font-bold tracking-[0.3em] text-gray-900">
                {shareCode}
              </span>
            </div>
            <button
              onClick={() => handleCopy(shareCode)}
              className="px-3 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
            />
            <button
              onClick={() => handleCopy(shareUrl)}
              className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              Copy
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gold-600 text-gray-900 font-semibold rounded-lg hover:bg-gold-500"
        >
          Done
        </button>
      </div>
    </div>
  );
}
