'use client';

/**
 * PromoCodeAutoApply
 *
 * Watches the URL for `?promo=<CODE>` (set by partner-lead SMS / email
 * CTAs), persists the code in localStorage so it survives navigation,
 * and applies it to the cart as soon as the cart has at least one item.
 *
 * Why localStorage between landing and cart: when a customer clicks the
 * SMS link they don't have a cart yet. We can't POST to /api/v1/cart/discount
 * because the cart_id cookie isn't set until they add an item. So we stash
 * the code and fire the apply on the next render after the cart materializes.
 *
 * Mounted in the root layout so every entry point catches the param.
 *
 * Lifecycle:
 *   1. mount → read ?promo= from URL → store as PENDING in localStorage,
 *      strip from URL so it doesn't pollute analytics or get re-applied on refresh
 *   2. on every cart update, if PENDING is set AND cart has items AND code
 *      isn't already applied → POST /api/v1/cart/discount
 *   3. on success → clear PENDING + refetch cart
 *   4. on 4xx (invalid code, expired, doesn't meet minOrderAmount yet) →
 *      keep PENDING so we retry as the cart grows past the minimum
 *   5. on network error → keep PENDING for next render
 *
 * Idempotent: re-running with the same code is a no-op (the server-side
 * discount engine dedupes by code on the cart).
 */

import { useEffect, useRef } from 'react';
import { useCartContext } from '@/contexts/CartContext';

const STORAGE_KEY = 'pending_promo_code';
const QUERY_PARAM = 'promo';

export default function PromoCodeAutoApply(): null {
  const { cart, customCartData, refetchCart } = useCartContext();
  // Track the last (code, itemsSig) we've already attempted so we don't
  // spam the endpoint on every render. Format: `${code}:${itemsCount}`.
  const lastAttemptedRef = useRef<string | null>(null);

  // 1) On mount: capture ?promo= → localStorage, then strip from URL.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const incoming = url.searchParams.get(QUERY_PARAM);
    if (!incoming) return;
    const normalized = incoming.trim().toUpperCase();
    if (!normalized) return;
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // localStorage can throw in private mode / quota exceeded — log and continue.
      console.warn('[PromoCodeAutoApply] localStorage unavailable; code will not persist across navigations');
    }
    url.searchParams.delete(QUERY_PARAM);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // 2) On every cart update: if a pending code exists and cart has items,
  //    try to apply it.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let pending: string | null = null;
    try {
      pending = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (!pending) return;

    const itemsCount = cart?.lines?.edges?.length ?? 0;
    if (itemsCount === 0) return;

    // Already applied? Done.
    const applied = customCartData?.appliedDiscounts ?? [];
    if (applied.some((d) => (d.code ?? '').toUpperCase() === pending)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* noop */
      }
      return;
    }

    // Don't retry the same (code, items-count) combo back-to-back.
    const attemptSig = `${pending}:${itemsCount}`;
    if (lastAttemptedRef.current === attemptSig) return;
    lastAttemptedRef.current = attemptSig;

    fetch('/api/v1/cart/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: pending }),
    })
      .then(async (res) => {
        if (res.ok) {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            /* noop */
          }
          await refetchCart();
          return;
        }
        // Non-OK: parse the error so we can decide whether to retry.
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const errMsg = data.error ?? `HTTP ${res.status}`;
        // Specific case: discount requires a higher min order than the cart
        // currently has. Don't clear — the user might add more items and
        // qualify on the next render.
        const isMinOrderError = /minimum|min[\s_-]?order|spend.*more/i.test(errMsg);
        if (!isMinOrderError) {
          // Code is genuinely invalid / expired / not applicable. Clear so
          // we don't keep retrying and don't show errors elsewhere.
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            /* noop */
          }
          console.warn('[PromoCodeAutoApply] Discount not applied:', errMsg);
        }
      })
      .catch((err) => {
        // Network error — keep the pending code, allow retry on next cart update.
        lastAttemptedRef.current = null;
        console.error('[PromoCodeAutoApply] Network error applying discount:', err);
      });
  }, [cart, customCartData, refetchCart]);

  return null;
}
