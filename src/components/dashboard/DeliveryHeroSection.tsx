'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import type { GroupOrderV2Full, SubOrderFull } from '@/lib/group-orders-v2/types';
import { updateTabV2, deleteTabV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  groupOrder: GroupOrderV2Full;
  activeTabIndex: number;
  activeTab: SubOrderFull;
  participantId: string;
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
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


export default function DeliveryHeroSection({
  groupOrder,
  activeTabIndex,
  activeTab,
  participantId,
  onTabChange,
  onAddDelivery,
  onEditDelivery,
  onRefresh,
}: Props): ReactElement {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [, setSaving] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabName, setEditTabName] = useState('');
  const tabInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus tab input when entering edit mode
  useEffect(() => {
    if (editingTabId && tabInputRef.current) {
      tabInputRef.current.focus();
      tabInputRef.current.select();
    }
  }, [editingTabId]);

  function startEditingTab(tab: SubOrderFull, index: number) {
    setEditingTabId(tab.id);
    setEditTabName(getTabLabel(tab, index));
  }

  async function saveTabName(tabId: string) {
    const trimmed = editTabName.trim();
    if (!trimmed) {
      setEditingTabId(null);
      return;
    }
    setSaving(true);
    try {
      await updateTabV2(groupOrder.shareCode, tabId, {
        name: trimmed,
        participantId,
      });
      onRefresh();
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setEditingTabId(null);
    }
  }

  // Focus title input when entering edit mode
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  function startEditingTitle() {
    setTitleValue(heroTitle);
    setEditingTitle(true);
  }

  async function saveTitleName() {
    const trimmed = titleValue.trim();
    if (!trimmed || trimmed === heroTitle) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    try {
      await updateTabV2(groupOrder.shareCode, activeTab.id, {
        name: trimmed,
        participantId,
      });
      onRefresh();
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setEditingTitle(false);
    }
  }

  const heroTitle = activeTab.name
    || getTabLabel(activeTab, activeTabIndex);

  const hasDetails = hasDeliveryDetails(activeTab);
  const deliveryDate = formatDeliveryDate(activeTab.deliveryDate);
  const deliveryTime = activeTab.deliveryTime && activeTab.deliveryTime !== 'TBD' ? activeTab.deliveryTime : '';
  const addr = activeTab.deliveryAddress;

  function getTabLabel(tab: SubOrderFull, index: number): string {
    // Treat "Location N" as a default -- override with party type label for first tab
    const isDefaultName = !tab.name || /^Location \d+$/.test(tab.name);
    if (index === 0 && isDefaultName && groupOrder.partyType) {
      return PARTY_TYPE_LABELS[groupOrder.partyType] || tab.name || `Location ${index + 1}`;
    }
    return tab.name || `Location ${index + 1}`;
  }

  const isHost = !!groupOrder.participants.find(p => p.id === participantId)?.isHost;
  const canDeleteTabs = isHost && groupOrder.tabs.length >= 2;

  async function handleDeleteTab(tab: SubOrderFull, tabIndex: number) {
    const tabName = getTabLabel(tab, tabIndex);
    if (!window.confirm(`Delete '${tabName}'? Draft items will be removed.`)) return;
    try {
      await deleteTabV2(groupOrder.shareCode, tab.id, participantId);
      if (tabIndex === activeTabIndex) {
        onTabChange(Math.max(0, activeTabIndex - 1));
      } else if (tabIndex < activeTabIndex) {
        onTabChange(activeTabIndex - 1);
      }
      onRefresh();
    } catch {
      // Silently fail
    }
  }

  const tabsAtLimit = groupOrder.tabs.length >= 4;
  const showTabs = true;

  return (
    <div className="mb-4">
      {groupOrder.isLastMinute && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-brand-yellow/90 border border-yellow-500 px-4 py-2.5 text-sm font-semibold text-gray-900">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Last-minute menu — every item guaranteed in stock for 48–72 hour delivery.</span>
        </div>
      )}
      <div>
        {/* Tabs row -- bigger, brighter active state */}
        {showTabs && (
          <div className="flex items-end gap-1 px-1">
            {groupOrder.tabs.map((tab, i) => (
              editingTabId === tab.id ? (
                <input
                  key={tab.id}
                  ref={tabInputRef}
                  value={editTabName}
                  onChange={(e) => setEditTabName(e.target.value)}
                  onBlur={() => saveTabName(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTabName(tab.id);
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  maxLength={100}
                  className="px-5 py-3 text-base font-bold rounded-t-2xl border-2 border-b-0 border-brand-blue bg-white text-gray-900 outline-none min-w-[100px] max-w-[220px]"
                />
              ) : (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => onTabChange(i)}
                    onDoubleClick={() => startEditingTab(tab, i)}
                    className={`px-6 py-3.5 text-base font-bold transition-all rounded-t-2xl border-2 border-b-0 ${
                      i === activeTabIndex
                        ? 'bg-brand-blue text-white border-brand-blue relative z-10 -mb-px shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 border-transparent'
                    } ${canDeleteTabs && tab.status !== 'CANCELLED' && tab.status !== 'FULFILLED' ? 'pr-8' : ''}`}
                    title="Double-click to rename"
                  >
                    {getTabLabel(tab, i)}
                  </button>
                  {canDeleteTabs && tab.status !== 'CANCELLED' && tab.status !== 'FULFILLED' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTab(tab, i); }}
                      className={`absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        i === activeTabIndex
                          ? 'text-white/60 hover:text-white hover:bg-white/20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={`Delete ${getTabLabel(tab, i)}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            ))}
            {!tabsAtLimit && (
              <button
                data-tour="add-tab"
                onClick={onAddDelivery}
                className="w-11 h-11 flex items-center justify-center rounded-t-2xl text-gray-400 hover:text-brand-blue hover:bg-gray-100 transition-colors ml-1 mb-0.5"
                title="Add another location"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content card -- collapsible order details */}
        <div data-tour="delivery-details" className={`bg-white/70 backdrop-blur-md shadow-sm border border-white/50 ${
          showTabs ? 'rounded-2xl rounded-tl-none' : 'rounded-2xl'
        }`}>
          {/* Collapsed bar -- just a chevron toggle */}
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/50 transition-colors rounded-2xl"
          >
            <span className="text-sm text-gray-500">
              {hasDetails
                ? `${deliveryDate}${deliveryTime ? ` at ${deliveryTime}` : ''}${addr?.address1 ? ` \u00B7 ${addr.address1}${addr.city ? ', ' + addr.city : ''}` : ''}`
                : 'Order details'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expandable details panel */}
          {detailsOpen && (
            <div className="px-5 pb-4 pt-1 border-t border-gray-200 space-y-3">
              {/* Order title -- editable */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 block">Tab Name</label>
                {editingTitle ? (
                  <input
                    ref={titleInputRef}
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={() => saveTitleName()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitleName();
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                    maxLength={100}
                    placeholder="Name your order..."
                    className="text-base font-semibold text-gray-900 bg-transparent border-b-2 border-brand-blue outline-none w-full py-1"
                  />
                ) : (
                  <button
                    onClick={startEditingTitle}
                    className="text-left group flex items-center gap-2 cursor-pointer hover:opacity-80"
                  >
                    <span className="text-base font-semibold text-gray-900">{heroTitle}</span>
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Delivery details */}
              {hasDetails ? (
                <div className="text-sm text-gray-600 space-y-1.5">
                  {deliveryDate && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{deliveryDate}{deliveryTime ? ` at ${deliveryTime}` : ''}</span>
                    </div>
                  )}
                  {addr?.address1 && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}{addr.city ? `, ${addr.city}` : ''}{addr.province ? `, ${addr.province}` : ''} {addr.zip || ''}</span>
                    </div>
                  )}
                  <button
                    onClick={onEditDelivery}
                    className="text-brand-blue hover:text-blue-700 font-medium text-sm"
                  >
                    Edit details
                  </button>
                </div>
              ) : (
                <button
                  onClick={onEditDelivery}
                  className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add location details
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
