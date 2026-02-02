'use client';

import { useState, ReactElement } from 'react';
import CountdownTimer from './CountdownTimer';
import ShareGroupModal from './ShareGroupModal';
import type { GroupOrderV2Full } from '@/lib/group-orders-v2/types';

interface Props {
  groupOrder: GroupOrderV2Full;
  isHost: boolean;
}

function getStatusChip(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'ACTIVE':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' };
    case 'CLOSED':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' };
    case 'COMPLETED':
      return { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' };
    default:
      return { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' };
  }
}

export default function GroupHeader({ groupOrder, isHost }: Props): ReactElement {
  const [showShare, setShowShare] = useState(false);
  const statusStyle = getStatusChip(groupOrder.status);
  const activeParticipants = (groupOrder.participants || []).filter(
    (p) => p.status === 'ACTIVE'
  ).length;

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Faint gold radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-5 px-4 md:py-6 md:px-6">
          {/* Left column - Info */}
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
              {groupOrder.name}
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {groupOrder.status}
              </span>
              {isHost && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-gold-500/20 text-gold-400 border-gold-500/30">
                  Host
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400">
              Code:{' '}
              <span className="font-mono text-gold-400">
                {groupOrder.shareCode}
              </span>
              {' \u00B7 '}
              <svg
                className="inline-block w-3.5 h-3.5 -mt-0.5 mr-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {activeParticipants} participant{activeParticipants !== 1 ? 's' : ''}
            </p>

            <button
              onClick={() => setShowShare(true)}
              className="w-full md:w-auto mt-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-white active:scale-95 transition-all"
            >
              Share
            </button>
          </div>

          {/* Right column - Timers */}
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end md:items-start">
            {groupOrder.timer?.earliestDelivery && (
              <CountdownTimer
                targetDate={groupOrder.timer.earliestDelivery}
                label="Party starts in"
                variant="delivery"
              />
            )}
            {groupOrder.timer?.earliestDeadline && (
              <CountdownTimer
                targetDate={groupOrder.timer.earliestDeadline}
                label="Order closes in"
                variant="deadline"
              />
            )}
          </div>
        </div>
      </div>

      <ShareGroupModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        shareCode={groupOrder.shareCode}
        groupName={groupOrder.name}
      />
    </>
  );
}
