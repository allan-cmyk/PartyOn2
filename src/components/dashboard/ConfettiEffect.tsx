'use client';

import { useEffect } from 'react';

interface Props {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiEffect({ trigger, onComplete }: Props) {
  useEffect(() => {
    if (!trigger) return;

    let cancelled = false;

    import('canvas-confetti').then((mod) => {
      if (cancelled) return;
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
        if (cancelled) return;
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.65, x: 0.55 },
          colors: ['#003087', '#FFD700', '#FF6B35', '#00B4D8', '#FF1493'],
        });
        onComplete?.();
      }, 200);
    });

    return () => {
      cancelled = true;
    };
  }, [trigger, onComplete]);

  return null;
}
