'use client';

import { useState, useEffect, ReactElement } from 'react';

interface Props {
  targetDate: string | null;
  label?: string;
}

export default function CountdownTimer({ targetDate, label }: Props): ReactElement | null {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${String(minutes).padStart(2, '0')}m`);
      parts.push(`${String(seconds).padStart(2, '0')}s`);
      setTimeLeft(parts.join(' '));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {label && <span className="text-gray-500">{label}</span>}
      <span className={`font-mono font-semibold ${
        timeLeft === 'Expired' ? 'text-red-600' : 'text-gray-900'
      }`}>
        {timeLeft}
      </span>
    </div>
  );
}
