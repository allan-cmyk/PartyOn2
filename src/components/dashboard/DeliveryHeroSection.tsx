'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import type { GroupOrderV2Full, SubOrderFull } from '@/lib/group-orders-v2/types';
import { updateGroupOrderV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  groupOrder: GroupOrderV2Full;
  activeTabIndex: number;
  activeTab: SubOrderFull;
  isHost: boolean;
  onTabChange: (index: number) => void;
  onAddDelivery: () => void;
  onEditDelivery: () => void;
  onRefresh: () => void;
}

function formatDeliveryDate(dateStr: string): string {
  if (!dateStr || dateStr === 'TBD') return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function hasDeliveryDetails(tab: SubOrderFull): boolean {
  return !!(
    tab.deliveryDate &&
    tab.deliveryDate !== 'TBD' &&
    tab.deliveryAddress?.address1
  );
}

export default function DeliveryHeroSection({
  groupOrder,
  activeTabIndex,
  activeTab,
  isHost,
  onTabChange,
  onAddDelivery,
  onEditDelivery,
  onRefresh,
}: Props): ReactElement {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(groupOrder.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect if name is a default placeholder
  const isDefaultName =
    groupOrder.name === 'New Order' ||
    groupOrder.name === "Party Host's Order" ||
    groupOrder.name.endsWith("'s Order");

  // Auto-focus the name input if it's a default name and user is host
  useEffect(() => {
    if (isHost && isDefaultName && !editing) {
      setEditing(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function handleSaveName() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === groupOrder.name) {
      setEditing(false);
      setEditName(groupOrder.name);
      return;
    }
    setSaving(true);
    try {
      await updateGroupOrderV2(groupOrder.shareCode, { name: trimmed });
      onRefresh();
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const hasDetails = hasDeliveryDetails(activeTab);
  const deliveryDate = formatDeliveryDate(activeTab.deliveryDate);
  const deliveryTime = activeTab.deliveryTime && activeTab.deliveryTime !== 'TBD' ? activeTab.deliveryTime : '';
  const addr = activeTab.deliveryAddress;
  const addressLine = addr?.address1
    ? `${addr.address1}${addr.city ? ', ' + addr.city : ''}`
    : '';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-6">
          {/* Order name */}
          <div className="mb-4">
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setEditing(false);
                    setEditName(groupOrder.name);
                  }
                }}
                placeholder="Type your order name here..."
                disabled={saving}
                className="w-full text-2xl md:text-4xl font-heading font-bold tracking-[0.04em] text-gray-900 bg-transparent border-b-2 border-dashed border-gray-300 focus:border-brand-blue outline-none pb-1 placeholder-gray-300 transition-colors"
              />
            ) : (
              <button
                onClick={() => isHost && setEditing(true)}
                className={`text-left w-full ${isHost ? 'cursor-pointer hover:opacity-80' : ''}`}
                disabled={!isHost}
              >
                <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-[0.04em] text-gray-900">
                  {groupOrder.name}
                </h1>
              </button>
            )}
          </div>

          {/* Delivery summary or Add button */}
          {hasDetails ? (
            <button
              onClick={isHost ? onEditDelivery : undefined}
              className={`flex items-center gap-3 text-base text-gray-600 ${isHost ? 'hover:text-brand-blue cursor-pointer' : ''}`}
              disabled={!isHost}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {deliveryDate}
              </span>
              {deliveryTime && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{deliveryTime}</span>
                </>
              )}
              {addressLine && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="truncate max-w-[200px]">{addressLine}</span>
                </>
              )}
              {isHost && (
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>
          ) : isHost ? (
            <button
              onClick={onEditDelivery}
              className="flex items-center gap-2 text-base font-medium text-brand-blue hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add location details
            </button>
          ) : (
            <p className="text-base text-gray-400">Delivery details not set yet</p>
          )}

          {/* Tab pills + Add delivery button */}
          {(groupOrder.tabs.length > 1 || isHost) && (
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-200/60">
              {groupOrder.tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(i)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    i === activeTabIndex
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  {tab.name || `Location ${i + 1}`}
                </button>
              ))}
              {isHost && (
                <button
                  onClick={onAddDelivery}
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-colors"
                  title="Add another location"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
