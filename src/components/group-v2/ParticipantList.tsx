'use client';

import { ReactElement } from 'react';
import type { ParticipantSummary } from '@/lib/group-orders-v2/types';

interface Props {
  participants: ParticipantSummary[];
  isHost: boolean;
  onRemove?: (pid: string) => void;
}

export default function ParticipantList({
  participants,
  isHost,
  onRemove,
}: Props): ReactElement {
  const active = (participants || []).filter((p) => p.status === 'ACTIVE');

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl font-bold text-gray-900">{active.length}</span>
        <span className="text-lg text-gray-600">participants</span>
      </div>
      <div className="space-y-3">
        {active.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-3.5 px-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-lg font-bold text-yellow-600">
                {(p.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">
                  {p.name}
                </span>
                {p.isHost && (
                  <span className="ml-2 text-base font-medium text-brand-yellow bg-yellow-50 px-2.5 py-0.5 rounded-full">
                    Host
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {p.ageVerified && (
                <span className="text-base font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">21+</span>
              )}
              {isHost && !p.isHost && onRemove && (
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-base text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
