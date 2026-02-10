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
  colorScheme?: 'blue' | 'yellow';
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

const COLOR_SCHEMES = {
  blue: {
    card: 'bg-sky-50 border-sky-200',
    label: 'text-sky-700',
    pill: 'bg-sky-100',
    number: 'text-gray-900',
    unit: 'text-sky-600',
  },
  yellow: {
    card: 'bg-amber-50 border-amber-200',
    label: 'text-amber-700',
    pill: 'bg-amber-100',
    number: 'text-gray-900',
    unit: 'text-amber-600',
  },
} as const;

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
  colorScheme = 'blue',
}: Props): ReactElement | null {
  const [segments, setSegments] = useState<TimeSegment[]>([]);
  const [expired, setExpired] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const scheme = COLOR_SCHEMES[colorScheme];

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

      setSegments(parseTimeLeft(remaining, variant === 'delivery'));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, variant]);

  if (!targetDate) return null;

  return (
    <div className={`border rounded-xl px-4 py-3 min-w-[160px] shadow-sm white-hover text-center ${scheme.card}`}>
      {label && (
        <p className={`text-xs uppercase tracking-wider font-semibold mb-1.5 ${scheme.label}`}>
          {label}
        </p>
      )}

      {expired ? (
        <p className="font-mono text-xl font-bold text-error">Expired</p>
      ) : (
        <div className="flex items-baseline justify-center gap-2">
          {segments.map((seg) => (
            <div key={seg.label} className={`flex items-baseline gap-0.5 rounded-lg px-2.5 py-1.5 ${scheme.pill}`}>
              <AnimatedDigit
                value={String(seg.value).padStart(2, '0')}
                colorClass={scheme.number}
                reducedMotion={reducedMotion}
              />
              <span className={`text-xs ${scheme.unit}`}>{seg.label}</span>
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
