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
    <div className="bg-white border-b border-v2-border py-4">
      <div className="flex items-center justify-between gap-4 px-4 md:px-8 lg:px-12">
        {/* Left - Tabs */}
        <div className="bg-v2-bgSoft rounded-lg p-1.5 flex gap-1 overflow-x-auto snap-x scrollbar-hide min-w-0">
          {(tabs || []).map((tab) => {
            const isActive = tab.id === activeTabId;
            const count = getItemCount(tab);

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 text-base font-semibold rounded-lg whitespace-nowrap snap-start shrink-0 v2-btn-press transition-transform duration-100 ${
                  isActive ? 'text-white' : 'text-v2-muted hover:text-v2-text'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-blue rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${getTabStatusColor(tab)}`}
                  />
                  {tab.name}
                  {count > 0 && (
                    <span
                      className={`text-sm rounded-full px-2 py-0.5 font-medium ${
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
              className="flex items-center gap-1.5 px-5 py-2.5 text-base font-semibold rounded-lg whitespace-nowrap snap-start shrink-0 border border-dashed border-v2-border text-v2-muted hover:text-brand-blue hover:border-brand-blue transition-colors v2-btn-press"
            >
              + Add Tab
            </button>
          )}
        </div>

        {/* Right - Share button */}
        {onShare && (
          <button
            onClick={onShare}
            className="shrink-0 px-6 py-2.5 text-base font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-[0.98] transition-all v2-btn-press"
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}
