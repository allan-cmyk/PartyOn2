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
      <h3 className="text-sm font-semibold text-v2-text uppercase tracking-wide mb-3">
        Participants ({active.length})
      </h3>
      <div className="space-y-2">
        {active.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-2 px-3 bg-v2-bgSoft rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-sm font-medium text-brand-blue">
                {(p.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-medium text-v2-text">
                  {p.name}
                </span>
                {p.isHost && (
                  <span className="ml-1.5 text-xs font-medium text-brand-blue">
                    Host
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {p.ageVerified && (
                <span className="text-xs text-green-600">21+</span>
              )}
              {isHost && !p.isHost && onRemove && (
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-xs text-red-500 hover:text-red-700"
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
