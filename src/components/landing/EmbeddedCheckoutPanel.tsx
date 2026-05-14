'use client';

/**
 * Embedded Stripe Checkout panel for the landing-page modals.
 *
 * Renders inline (no redirect) so the customer can pay without leaving the
 * popup. Mounted in place of the contact/delivery form once they confirm
 * "Pay now" and we've created the draft order.
 *
 * Flow:
 *   parent → POST /api/v1/landing/quote (mode: pay-now) → token
 *   parent → POST /api/v1/invoice/<token>/checkout { embedded: true }
 *   parent renders <EmbeddedCheckoutPanel clientSecret={...} />
 *   Stripe handles card capture; on success redirects to /checkout/success
 */

import { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

// Singleton so we only load Stripe.js once across modal mounts.
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error(
        '[EmbeddedCheckoutPanel] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set',
      );
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

type Props = {
  clientSecret: string;
  /** Triggered if Stripe fails to mount. */
  onError?: (err: Error) => void;
  /**
   * Fallback URL to send the customer to if the embedded Stripe checkout
   * can't be loaded (publishable key missing, network blocked, ad blocker
   * killing js.stripe.com). The editable /invoice/<token> page has its
   * own redirect-mode Stripe checkout — works even when Stripe.js can't
   * load in-page.
   */
  fallbackUrl?: string;
};

export default function EmbeddedCheckoutPanel({
  clientSecret,
  onError,
  fallbackUrl,
}: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStripe()
      .then((s) => {
        if (cancelled) return;
        if (!s) {
          setError(
            "Couldn't load secure checkout in-page. Use the button below to finish on our secure invoice page.",
          );
          onError?.(new Error('stripe-load-failed'));
          return;
        }
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not initialize checkout.');
        onError?.(err instanceof Error ? err : new Error('stripe-init-failed'));
      });
    return () => {
      cancelled = true;
    };
  }, [onError]);

  if (error) {
    return (
      <div className="space-y-3">
        <div
          className="rounded-md p-4 text-sm"
          style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
        >
          {error}
        </div>
        {fallbackUrl && (
          <a
            href={fallbackUrl}
            className="block w-full text-center font-bold py-3.5 rounded-md tracking-wide transition-transform hover:scale-[1.01]"
            style={{ background: '#0B74B8', color: '#FFFFFF' }}
          >
            Continue to secure checkout →
          </a>
        )}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        Loading secure checkout…
      </div>
    );
  }

  return (
    <div id="embedded-checkout" className="rounded-md overflow-hidden">
      <EmbeddedCheckoutProvider
        stripe={getStripe()}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
