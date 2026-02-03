'use client';

import { ReactElement } from 'react';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';
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

function getDateSubtitle(groupOrder: GroupOrderV2Full): string {
  const tab = (groupOrder.tabs || [])[0];
  const dateStr = tab?.deliveryDate;
  const date = dateStr ? new Date(dateStr) : new Date();
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  return `${month} ${year} ATX`;
}

export default function GroupHeader({ groupOrder, isHost }: Props): ReactElement {
  const statusStyle = getStatusChip(groupOrder.status);
  const activeParticipants = (groupOrder.participants || []).filter(
    (p) => p.status === 'ACTIVE'
  ).length;

  return (
    <div className="relative overflow-hidden border-b border-v2-border">
      <Image
        src="/images/partners/group-dashboard-bg.png"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-white/80" />

      {/* Single horizontal row: name+date LEFT, timers RIGHT */}
      <div className="relative py-5 px-4 md:py-6 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side - Name, date, badges, code */}
          <div className="flex flex-col gap-1.5">
            <div>
              <h1 className="font-sans text-3xl md:text-4xl font-bold text-v2-text tracking-tight">
                {groupOrder.name}
              </h1>
              <p className="text-sm font-semibold tracking-[0.2em] text-v2-muted mt-0.5">
                {getDateSubtitle(groupOrder)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {statusStyle.dot && (
                  <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                )}
                {groupOrder.status}
              </span>
              {isHost && (
                <span className="text-sm font-medium px-3 py-1 rounded-full border bg-v2-blueTint text-brand-blue border-brand-blue/20">
                  Host
                </span>
              )}
              <span className="text-sm text-v2-muted">
                Code:{' '}
                <span className="font-mono font-semibold text-v2-text">
                  {groupOrder.shareCode}
                </span>
                {' \u00B7 '}
                {activeParticipants} participant{activeParticipants !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Right side - Timers side by side */}
          <div className="flex flex-row gap-3 shrink-0">
            {groupOrder.timer?.earliestDelivery && (
              <CountdownTimer
                targetDate={groupOrder.timer.earliestDelivery}
                label="Party starts in"
                variant="delivery"
                colorScheme="blue"
              />
            )}
            {groupOrder.timer?.earliestDeadline && (
              <CountdownTimer
                targetDate={groupOrder.timer.earliestDeadline}
                label="Order closes in"
                variant="deadline"
                colorScheme="yellow"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
