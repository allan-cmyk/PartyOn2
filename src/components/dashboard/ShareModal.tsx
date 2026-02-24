'use client';

import { useState, type ReactElement, type FormEvent } from 'react';

interface Props {
  shareCode: string;
  hostEmail?: string | null;
  hostPhone?: string | null;
  onClose: () => void;
}

export default function ShareModal({ shareCode, hostEmail: existingEmail, hostPhone: existingPhone, onClose }: Props): ReactElement {
  const hasContactInfo = !!(existingEmail || existingPhone);
  const [email, setEmail] = useState(existingEmail || '');
  const [phone, setPhone] = useState(existingPhone || '');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/${shareCode}`;

  async function handleSendLink(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) return;

    setSending(true);
    setSendError('');
    try {
      const res = await fetch(`/api/v2/group-orders/${shareCode}/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostEmail: email.trim() || undefined,
          hostPhone: phone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to send');
      setLinkSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send link');
    } finally {
      setSending(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
        <p className="text-sm text-gray-500 text-center mb-4">
          Send this link to friends so they can add their own items.
        </p>

        {/* Share link + copy */}
        <div className="flex items-center gap-2 mb-6">
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

        {/* Email/phone capture */}
        {!hasContactInfo && !linkSent && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 text-center mb-3">
                Send yourself this link so you can come back later.
              </p>
              <form onSubmit={handleSendLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
                />

                {sendError && (
                  <p className="text-sm text-red-600">{sendError}</p>
                )}

                <button
                  type="submit"
                  disabled={sending || (!email.trim() && !phone.trim())}
                  className="w-full py-3 bg-brand-yellow text-gray-900 text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Me the Link'}
                </button>
              </form>
            </div>
          </>
        )}

        {linkSent && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-green-600 text-center font-medium">
              Link sent! Check your {email ? 'email' : 'phone'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
