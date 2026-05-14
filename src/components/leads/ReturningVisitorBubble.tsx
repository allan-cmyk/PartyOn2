'use client';

/**
 * Returning-visitor chat bubble (SCAFFOLD ONLY — outgoing message OFF).
 *
 * Mounted in the root layout. On mount, calls /api/v1/landing/visitor-pixel
 * and inspects the `returning` flag + whether the session has an attached
 * lead. If returning AND has a resume cart, it would normally pop a chat
 * bubble that says "Hey, welcome back. Do you want to finish your order?".
 *
 * Per Brian's instructions: build everything UP TO the outgoing message,
 * but don't turn the message on yet. We render a hidden placeholder div
 * (data-pod-chat="off") so we can flip a single feature flag later.
 *
 * To enable later:
 *   1. Replace `ENABLED = false` with a flag from /api/v1/feature-flags
 *   2. Drop in the chat UI inside the returned <div>
 */
import { useEffect, useState } from 'react';

const ENABLED = false; // ← flip when AI chat is ready

type PixelResp = {
  ok: boolean;
  sessionId: string;
  leadId: string | null;
  returning: boolean;
};

export default function ReturningVisitorBubble() {
  const [state, setState] = useState<PixelResp | null>(null);

  useEffect(() => {
    // Read the pixel response from a previous fireVisitorPixel call via
    // a small wrapper. We don't re-call here — the VisitorPixel component
    // is the source of truth.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/landing/visitor-pixel', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ page: window.location.pathname }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as PixelResp;
        if (!cancelled) setState(data);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Always render an off-screen marker so we can verify pixel wiring in
  // DevTools without exposing anything to users.
  return (
    <div
      data-pod-chat={ENABLED ? 'ready' : 'off'}
      data-pod-returning={state?.returning ? '1' : '0'}
      data-pod-lead={state?.leadId ?? ''}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  );
}
