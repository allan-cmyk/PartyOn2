'use client';

/**
 * PendingPromoBadge
 *
 * Small floating badge that confirms a partner-lead promo code is "queued"
 * to auto-apply at checkout. Shown when:
 *
 *   - localStorage has a `pending_promo_code` (set by `PromoCodeAutoApply`
 *     when a `?promo=<CODE>` URL lands the customer on the site)
 *   - AND the same code is NOT already applied to the cart
 *
 * Hides automatically once `PromoCodeAutoApply` successfully applies the
 * code (which clears localStorage) or if the code turns out to be invalid.
 *
 * Mounted in the root layout. No-op when there's nothing pending.
 *
 * UX rationale: partner-lead customers arrive at the site via an SMS link
 * with `?promo=…` in it. Without a visible signal, they have to trust
 * something will happen automatically — anxiety-inducing. A small chip
 * that reads "Code X will auto-apply at checkout" removes that doubt.
 */

import { useEffect, useState } from 'react';
import { useCartContext } from '@/contexts/CartContext';

const STORAGE_KEY = 'pending_promo_code';

export default function PendingPromoBadge(): React.ReactElement | null {
  const { customCartData } = useCartContext();
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Re-check localStorage whenever the cart changes (in case
  // PromoCodeAutoApply just cleared it after a successful apply).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const code = localStorage.getItem(STORAGE_KEY);
      setPendingCode(code);
    } catch {
      setPendingCode(null);
    }
  }, [customCartData]);

  // Also poll localStorage every 2s in case PromoCodeAutoApply writes it
  // after we mount. Cheap; only runs when the badge is mounted.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      try {
        const code = localStorage.getItem(STORAGE_KEY);
        setPendingCode((prev) => (prev !== code ? code : prev));
      } catch {
        /* noop */
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!pendingCode || dismissed) return null;

  // Hide if already on the cart (avoid double-confirming).
  const applied = customCartData?.appliedDiscounts ?? [];
  if (applied.some((d) => (d.code ?? '').toUpperCase() === pendingCode)) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-xs"
    >
      <div className="bg-brand-blue text-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3">
        <CheckIcon />
        <div className="flex-1 text-sm leading-tight">
          <div className="font-semibold">
            Code <span className="font-mono">{pendingCode}</span> ready
          </div>
          <div className="text-white/85 text-xs mt-0.5">
            Auto-applies when you add items to your cart.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-white/70 hover:text-white text-lg leading-none -mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function CheckIcon(): React.ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-brand-yellow flex-shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
