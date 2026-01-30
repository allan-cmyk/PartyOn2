'use client';

import { useState, ReactElement } from 'react';
import CountdownTimer from './CountdownTimer';
import ShareGroupModal from './ShareGroupModal';
import type { GroupOrderV2Full } from '@/lib/group-orders-v2/types';

interface Props {
  groupOrder: GroupOrderV2Full;
  isHost: boolean;
}

export default function GroupHeader({ groupOrder, isHost }: Props): ReactElement {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {groupOrder.name}
              </h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  groupOrder.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : groupOrder.status === 'CLOSED'
                    ? 'bg-yellow-100 text-yellow-700'
                    : groupOrder.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {groupOrder.status}
              </span>
              {isHost && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gold-100 text-gold-700">
                  Host
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Code: <span className="font-mono font-semibold">{groupOrder.shareCode}</span>
              {' · '}
              {groupOrder.participants.filter((p) => p.status === 'ACTIVE').length} participants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CountdownTimer
              targetDate={groupOrder.timer.countdownTarget}
              label="Next deadline:"
            />
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
            >
              Share
            </button>
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
