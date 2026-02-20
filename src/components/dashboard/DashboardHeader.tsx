'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { GroupOrderV2Full } from '@/lib/group-orders-v2/types';
import { updateGroupOrderV2 } from '@/lib/group-orders-v2/api-client';
import ParticipantPanel from './ParticipantPanel';

interface Props {
  groupOrder: GroupOrderV2Full;
  participantId: string;
  isLocked: boolean;
  onRefresh: () => void;
  onShareClick: () => void;
}

const DELIVERY_CONTEXT_LABELS: Record<string, string> = {
  HOUSE: 'House / BnB',
  BOAT: 'Boat / Marina',
  VENUE: 'Business / Venue',
  HOTEL: 'Hotel',
  OTHER: 'Other',
};

export default function DashboardHeader({
  groupOrder,
  participantId,
  isLocked,
  onRefresh,
  onShareClick,
}: Props): ReactElement {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(groupOrder.name);
  const [saving, setSaving] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isHost = groupOrder.participants.find(
    (p) => p.id === participantId
  )?.isHost;

  const activeParticipants = groupOrder.participants.filter(
    (p) => p.status === 'ACTIVE'
  );
  const otherNames = activeParticipants
    .filter((p) => p.id !== participantId)
    .map((p) => p.name);

  const tab = groupOrder.tabs[0];
  const contextLabel = tab
    ? DELIVERY_CONTEXT_LABELS[tab.deliveryContextType] || ''
    : '';

  // Close panel on outside click
  useEffect(() => {
    if (!showParticipants) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowParticipants(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showParticipants]);

  async function handleSaveName() {
    if (!editName.trim() || editName === groupOrder.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateGroupOrderV2(groupOrder.shareCode, { name: editName.trim() });
      onRefresh();
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/partyon-logo.png"
              alt="Party On"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden sm:block w-px h-6 bg-gray-300" />
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm font-semibold border-2 border-gray-200 rounded-lg px-2 py-1 focus:border-brand-blue focus:ring-0 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') {
                      setEditing(false);
                      setEditName(groupOrder.name);
                    }
                  }}
                  autoFocus
                  disabled={saving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Save
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => isHost && setEditing(true)}
                  className={`text-sm font-heading font-bold tracking-[0.08em] text-gray-900 ${isHost ? 'hover:text-brand-blue cursor-pointer' : ''}`}
                  disabled={!isHost}
                >
                  {groupOrder.name}
                </button>
                {contextLabel && (
                  <p className="text-xs text-gray-500">{contextLabel}</p>
                )}
              </div>
            )}
            {isLocked && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                Locked
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Participant count button */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden md:inline">
                {activeParticipants.length === 1
                  ? 'Just you'
                  : `You + ${otherNames.slice(0, 2).join(', ')}${otherNames.length > 2 ? ` +${otherNames.length - 2}` : ''}`}
              </span>
              <span className="md:hidden">{activeParticipants.length}</span>
            </button>

            {showParticipants && tab && (
              <ParticipantPanel
                shareCode={groupOrder.shareCode}
                tabId={tab.id}
                participantId={participantId}
                participants={groupOrder.participants}
                isLocked={isLocked}
                onRefresh={() => {
                  onRefresh();
                  setShowParticipants(false);
                }}
                onClose={() => setShowParticipants(false)}
              />
            )}
          </div>

          <button
            onClick={onShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-blue border border-brand-blue/30 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </header>
  );
}
