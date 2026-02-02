'use client';

import { useState, useEffect, ReactElement } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface TimeSegment {
  value: number;
  label: string;
}

interface Props {
  targetDate: string | null;
  label?: string;
  helperText?: string;
  variant?: 'delivery' | 'deadline';
}

function parseTimeLeft(diff: number): TimeSegment[] {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const segments: TimeSegment[] = [];
  if (days > 0) segments.push({ value: days, label: 'd' });
  segments.push({ value: hours, label: 'h' });
  segments.push({ value: minutes, label: 'm' });
  segments.push({ value: seconds, label: 's' });
  return segments;
}

function getDeadlineColor(diff: number): string {
  const twoHours = 2 * 60 * 60 * 1000;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  if (diff < twoHours) return 'text-red-400';
  if (diff < twentyFourHours) return 'text-amber-400';
  return 'text-white';
}

interface DigitProps {
  value: string;
  colorClass: string;
  reducedMotion: boolean;
}

function AnimatedDigit({ value, colorClass, reducedMotion }: DigitProps): ReactElement {
  if (reducedMotion) {
    return (
      <span className={`font-mono text-xl md:text-2xl font-bold ${colorClass}`}>
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`font-mono text-xl md:text-2xl font-bold ${colorClass}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function CountdownTimer({
  targetDate,
  label,
  helperText,
  variant = 'delivery',
}: Props): ReactElement | null {
  const [segments, setSegments] = useState<TimeSegment[]>([]);
  const [expired, setExpired] = useState(false);
  const [diff, setDiff] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const remaining = target - now;

      if (remaining <= 0) {
        setExpired(true);
        setSegments([]);
        return;
      }

      setDiff(remaining);
      setSegments(parseTimeLeft(remaining));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) return null;

  const numberColor = variant === 'delivery'
    ? 'text-gold-400'
    : getDeadlineColor(diff);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-[160px] hover:-translate-y-0.5 hover:shadow-md transition-all">
      {label && (
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">
          {label}
        </p>
      )}

      {expired ? (
        <p className="font-mono text-xl font-bold text-red-400">Expired</p>
      ) : (
        <div className="flex items-baseline gap-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-baseline gap-0.5">
              <AnimatedDigit
                value={String(seg.value).padStart(2, '0')}
                colorClass={numberColor}
                reducedMotion={reducedMotion}
              />
              <span className="text-xs text-gray-500">{seg.label}</span>
            </div>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
