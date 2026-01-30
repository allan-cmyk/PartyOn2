'use client';

import { ReactElement } from 'react';
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
  if (new Date(tab.orderDeadline) < new Date()) return 'bg-amber-500';
  return 'bg-green-500';
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  isHost,
}: Props): ReactElement {
  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-2">
      <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {(tabs || []).map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap snap-start transition-colors shrink-0 ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${getTabStatusColor(tab)}`}
              />
              {tab.name}
            </button>
          );
        })}

        {isHost && (
          <button
            onClick={onAddTab}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap snap-start shrink-0 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
          >
            + Add Tab
          </button>
        )}
      </div>
    </div>
  );
}
