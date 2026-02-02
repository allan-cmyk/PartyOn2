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
}: Props): ReactElement {
  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6">
        <div className="bg-gray-100 rounded-lg p-1 flex gap-0.5 overflow-x-auto snap-x scrollbar-hide">
          {(tabs || []).map((tab) => {
            const isActive = tab.id === activeTabId;
            const count = getItemCount(tab);

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap snap-start shrink-0 active:scale-[0.97] transition-transform duration-100 ${
                  isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gray-900 rounded-md shadow-sm"
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
                          : 'bg-gray-200 text-gray-600'
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
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap snap-start shrink-0 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            >
              + Add Tab
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
