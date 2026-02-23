'use client';

import { type ReactElement } from 'react';
import type { ToastMessage } from './useToast';

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

const BG_MAP: Record<ToastMessage['type'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-brand-blue',
};

export default function ToastContainer({ toasts, onDismiss }: Props): ReactElement | null {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${BG_MAP[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto animate-slide-up flex items-center gap-2 max-w-sm`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/70 hover:text-white flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
