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

function parseTimeLeft(diff: number, daysOnly?: boolean): TimeSegment[] {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (daysOnly) {
    return [{ value: days, label: days === 1 ? 'day' : 'days' }];
  }

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
  if (diff < twoHours) return 'text-v2-danger';
  if (diff < twentyFourHours) return 'text-amber-500';
  return 'text-v2-text';
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
      setSegments(parseTimeLeft(remaining, variant === 'delivery'));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, variant]);

  if (!targetDate) return null;

  const numberColor = variant === 'delivery'
    ? 'text-brand-yellow'
    : getDeadlineColor(diff);

  return (
    <div className="bg-v2-card border border-v2-border rounded-xl px-4 py-3 min-w-[160px] shadow-sm v2-card-hover text-center">
      {label && (
        <p className="text-xs uppercase tracking-wider text-brand-blue font-semibold mb-1.5">
          {label}
        </p>
      )}

      {expired ? (
        <p className="font-mono text-xl font-bold text-v2-danger">Expired</p>
      ) : (
        <div className="flex items-baseline justify-center gap-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-baseline gap-0.5 bg-v2-bgSoft rounded-lg px-2.5 py-1.5">
              <AnimatedDigit
                value={String(seg.value).padStart(2, '0')}
                colorClass={numberColor}
                reducedMotion={reducedMotion}
              />
              <span className="text-xs text-v2-muted">{seg.label}</span>
            </div>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-v2-muted mt-1">{helperText}</p>
      )}
    </div>
  );
}
