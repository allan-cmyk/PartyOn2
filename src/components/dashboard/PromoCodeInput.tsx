'use client';

import { useState, type ReactElement } from 'react';
import type { AppliedPromo } from '@/lib/group-orders-v2/types';
import { validatePromoCode } from '@/lib/group-orders-v2/api-client';

interface Props {
  appliedPromo: AppliedPromo | null;
  subtotal: number;
  onApply: (promo: AppliedPromo) => void;
  onRemove: () => void;
}

export default function PromoCodeInput({
  appliedPromo,
  subtotal,
  onApply,
  onRemove,
}: Props): ReactElement {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) return;

    setError('');
    setLoading(true);

    try {
      const promo = await validatePromoCode(trimmed, subtotal);
      onApply(promo);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  if (appliedPromo) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium text-green-700 truncate">
          {appliedPromo.label}
        </span>
        {appliedPromo.freeDelivery && (
          <span className="text-xs font-bold text-green-800 bg-green-100 px-1.5 py-0.5 rounded flex-shrink-0">
            FREE DELIVERY
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Promo or referral code"
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
