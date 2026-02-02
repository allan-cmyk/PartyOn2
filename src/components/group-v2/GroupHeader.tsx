'use client';

import { useState, ReactElement } from 'react';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';
import ShareGroupModal from './ShareGroupModal';
import type { GroupOrderV2Full } from '@/lib/group-orders-v2/types';

interface Props {
  groupOrder: GroupOrderV2Full;
  isHost: boolean;
}

function getStatusChip(status: string): { bg: string; text: string; border: string; dot?: string } {
  switch (status) {
    case 'ACTIVE':
      return { bg: 'bg-v2-success/10', text: 'text-v2-success', border: 'border-v2-success/30', dot: 'bg-v2-success' };
    case 'CLOSED':
      return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' };
    case 'COMPLETED':
      return { bg: 'bg-brand-blue/10', text: 'text-brand-blue', border: 'border-brand-blue/30' };
    default:
      return { bg: 'bg-v2-danger/10', text: 'text-v2-danger', border: 'border-v2-danger/30' };
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
      <div className="relative overflow-hidden border-b border-v2-border">
        <Image
          src="/images/partners/group-dashboard-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-5 px-4 md:py-6 md:px-6">
          {/* Left column - Info */}
          <div className="flex flex-col gap-2">
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-v2-text tracking-tight">
              {groupOrder.name}
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {statusStyle.dot && (
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                )}
                {groupOrder.status}
              </span>
              {isHost && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-v2-blueTint text-brand-blue border-brand-blue/20">
                  Host
                </span>
              )}
            </div>

            <p className="text-sm text-v2-muted">
              Code:{' '}
              <span className="font-mono font-semibold text-v2-text">
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
              className="w-full md:w-auto mt-1 px-4 py-2 text-sm font-medium rounded-lg border border-v2-border text-v2-muted hover:text-brand-blue hover:border-brand-blue active:scale-[0.98] transition-all v2-btn-press"
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
