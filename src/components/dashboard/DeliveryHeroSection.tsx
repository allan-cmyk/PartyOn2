'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import type { GroupOrderV2Full, SubOrderFull, PartyType } from '@/lib/group-orders-v2/types';
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

const PARTY_TYPE_LABELS: Record<string, string> = {
  BOAT: 'Boat Order',
  BACH: 'Bach Order',
  WEDDING: 'Wedding Order',
  BIRTHDAY: 'Birthday Order',
  CORPORATE: 'Corporate Order',
  TAILGATE: 'Tailgate Order',
  HOLIDAY: 'Holiday Order',
  HOUSE_PARTY: 'House Order',
  OTHER: 'Order',
};

const PARTY_TYPE_OPTIONS: { value: PartyType; label: string }[] = [
  { value: 'BOAT', label: 'Boat' },
  { value: 'BACH', label: 'Bach' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'HOUSE_PARTY', label: 'Private' },
  { value: 'OTHER', label: 'Other' },
];

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
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Close selector when clicking outside
  useEffect(() => {
    if (!showTypeSelector) return;
    function handleClick(e: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setShowTypeSelector(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTypeSelector]);

  async function handleSelectPartyType(type: PartyType) {
    if (type === groupOrder.partyType) {
      setShowTypeSelector(false);
      return;
    }
    setSaving(true);
    try {
      await updateGroupOrderV2(groupOrder.shareCode, { partyType: type });
      onRefresh();
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setShowTypeSelector(false);
    }
  }

  const heroTitle = groupOrder.partyType
    ? PARTY_TYPE_LABELS[groupOrder.partyType] || 'Your Order'
    : 'Your Order';

  const hasDetails = hasDeliveryDetails(activeTab);
  const deliveryDate = formatDeliveryDate(activeTab.deliveryDate);
  const deliveryTime = activeTab.deliveryTime && activeTab.deliveryTime !== 'TBD' ? activeTab.deliveryTime : '';
  const addr = activeTab.deliveryAddress;
  const addressLine = addr?.address1
    ? `${addr.address1}${addr.city ? ', ' + addr.city : ''}`
    : '';

  function getTabLabel(tab: SubOrderFull, index: number): string {
    // Treat "Location N" as a default -- override with party type label for first tab
    const isDefaultName = !tab.name || /^Location \d+$/.test(tab.name);
    if (index === 0 && isDefaultName && groupOrder.partyType) {
      return PARTY_TYPE_LABELS[groupOrder.partyType] || tab.name || `Location ${index + 1}`;
    }
    return tab.name || `Location ${index + 1}`;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-6">
          {/* Party type title */}
          <div className="mb-4 relative" ref={selectorRef}>
            <button
              onClick={() => isHost && setShowTypeSelector(!showTypeSelector)}
              className={`text-left w-full group ${isHost ? 'cursor-pointer hover:opacity-80' : ''}`}
              disabled={!isHost}
            >
              <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-[0.04em] text-gray-900 inline">
                {heroTitle}
              </h1>
              {isHost && (
                <svg className="w-5 h-5 inline-block ml-2 text-gray-400 group-hover:text-brand-blue transition-colors align-baseline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>
            {showTypeSelector && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-20 min-w-[200px]">
                {PARTY_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectPartyType(opt.value)}
                    disabled={saving}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      groupOrder.partyType === opt.value
                        ? 'bg-brand-blue text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
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
