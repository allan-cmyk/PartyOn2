'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Props {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiEffect({ trigger, onComplete }: Props) {
  const firedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const fire = useCallback(async () => {
    try {
      const mod = await import('canvas-confetti');
      const confetti = mod.default;

      // Party-colored burst from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#003087', '#FFD700', '#FF6B35', '#00B4D8', '#FF1493'],
      });

      // Second burst slightly delayed
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.65, x: 0.55 },
          colors: ['#003087', '#FFD700', '#FF6B35', '#00B4D8', '#FF1493'],
        });
        onCompleteRef.current?.();
      }, 200);
    } catch {
      // If confetti fails, still call onComplete to reset trigger
      onCompleteRef.current?.();
    }
  }, []);

  useEffect(() => {
    if (!trigger) {
      firedRef.current = false;
      return;
    }
    // Guard against strict mode double-fire
    if (firedRef.current) return;
    firedRef.current = true;
    fire();
  }, [trigger, fire]);

  return null;
}
