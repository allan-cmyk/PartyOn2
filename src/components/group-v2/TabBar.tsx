'use client';

import { ReactElement } from 'react';
import { motion } from 'framer-motion';
import type { SubOrderFull } from '@/lib/group-orders-v2/types';

interface Props {
  tabs: SubOrderFull[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onAddTab?: () => void;
  isHost: boolean;
  onShare?: () => void;
}

function getTabStatusColor(tab: SubOrderFull): string {
  if (tab.status === 'CANCELLED') return 'bg-red-500';
  if (tab.status === 'FULFILLED') return 'bg-blue-500';
  if (tab.status === 'LOCKED') return 'bg-gray-400';
  if (tab.orderDeadline && new Date(tab.orderDeadline) < new Date()) return 'bg-amber-500';
  return 'bg-green-500';
}

function getItemCount(tab: SubOrderFull): number {
  return (tab.draftItems || []).length;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  isHost,
  onShare,
}: Props): ReactElement {
  return (
    <div className="bg-white border-b border-v2-border py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-4 md:px-6">
        {/* Left - Tabs */}
        <div className="bg-v2-bgSoft rounded-lg p-1 flex gap-0.5 overflow-x-auto snap-x scrollbar-hide min-w-0">
          {(tabs || []).map((tab) => {
            const isActive = tab.id === activeTabId;
            const count = getItemCount(tab);

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap snap-start shrink-0 v2-btn-press transition-transform duration-100 ${
                  isActive ? 'text-white' : 'text-v2-muted hover:text-v2-text'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-blue rounded-md shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${getTabStatusColor(tab)}`}
                  />
                  {tab.name}
                  {count > 0 && (
                    <span
                      className={`text-xs rounded-full px-1.5 py-0.5 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-v2-bgSoft text-v2-muted'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {isHost && (
            <button
              onClick={onAddTab}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap snap-start shrink-0 border border-dashed border-v2-border text-v2-muted hover:text-brand-blue hover:border-brand-blue transition-colors v2-btn-press"
            >
              + Add Tab
            </button>
          )}
        </div>

        {/* Right - Share button */}
        {onShare && (
          <button
            onClick={onShare}
            className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-[0.98] transition-all v2-btn-press"
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}
