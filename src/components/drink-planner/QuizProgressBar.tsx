'use client';

interface QuizProgressBarProps {
  current: number;
  total: number;
}

export default function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  return (
    <div className="w-full">
      <span className="text-xs text-gray-400 tracking-[0.1em] uppercase">
        Step {current} of {total}
      </span>
    </div>
  );
}
