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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
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

function getDisplayName(name: string): string {
  if (/party/i.test(name)) return name;
  return `${name}'s Party`;
}

const PARTY_TYPE_LABELS: Record<string, string> = {
  BOAT: 'Boat Order',
  BACH: 'Bach Order',
  WEDDING: 'Wedding Order',
  BIRTHDAY: 'Birthday Order',
  CORPORATE: 'Corporate Order',
  TAILGATE: 'Tailgate Order',
  HOLIDAY: 'Holiday Order',
  OTHER: 'Order',
};

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
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  function getTabLabel(tab: SubOrderFull, index: number): string {
    if (tab.name) return tab.name;
    if (index === 0 && groupOrder.partyType) {
      return PARTY_TYPE_LABELS[groupOrder.partyType] || `Location ${index + 1}`;
    }
    return `Location ${index + 1}`;
  }

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
                className={`text-left w-full group ${isHost ? 'cursor-pointer hover:opacity-80' : ''}`}
                disabled={!isHost}
              >
                <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-[0.04em] text-gray-900 inline">
                  {getDisplayName(groupOrder.name)}
                </h1>
                {isHost && (
                  <svg className="w-5 h-5 inline-block ml-2 text-gray-400 group-hover:text-brand-blue transition-colors align-baseline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Delivery details -- collapsible */}
          {hasDetails ? (
            <div>
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{deliveryDate}{deliveryTime ? ` at ${deliveryTime}` : ''}</span>
                <span className="text-gray-300">|</span>
                <span className="truncate max-w-[180px]">{addressLine}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${detailsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {detailsOpen && (
                <div className="mt-3 pl-6 text-sm text-gray-600 space-y-1">
                  {deliveryDate && <p>Date: {deliveryDate}</p>}
                  {deliveryTime && <p>Time: {deliveryTime}</p>}
                  {addr?.address1 && (
                    <p>Address: {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}{addr.city ? `, ${addr.city}` : ''}{addr.province ? `, ${addr.province}` : ''} {addr.zip || ''}</p>
                  )}
                  {isHost && (
                    <button
                      onClick={onEditDelivery}
                      className="text-brand-blue hover:text-blue-700 font-medium mt-1"
                    >
                      Edit details
                    </button>
                  )}
                </div>
              )}
            </div>
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
                  {getTabLabel(tab, i)}
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
