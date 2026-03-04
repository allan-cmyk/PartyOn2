'use client';

import { ReactElement, useState } from 'react';
import Link from 'next/link';

interface ClientOrder {
  id: string;
  type: 'dashboard';
  clientName: string;
  orderName: string;
  createdAt: string;
  deliveryDate: string | null;
  itemCount: number;
  totalCents: number;
  lifecycleStatus: 'draft' | 'in_progress' | 'paid' | 'completed';
  dashboardUrl: string;
  shareCode: string;
}

interface OrdersTabProps {
  clientOrders: ClientOrder[];
}

type SubTab = 'draft' | 'in_progress' | 'paid' | 'completed';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'draft', label: 'Drafts' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'paid', label: 'Paid' },
  { key: 'completed', label: 'Completed' },
];

const statusBadge = (status: SubTab) => {
  const map: Record<SubTab, string> = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  };
  return map[status];
};

const statusLabel = (status: SubTab) => {
  const map: Record<SubTab, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    paid: 'Paid',
    completed: 'Completed',
  };
  return map[status];
};

const cents = (c: number) =>
  `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OrdersTab({ clientOrders }: OrdersTabProps): ReactElement {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('draft');

  const counts: Record<SubTab, number> = {
    draft: clientOrders.filter((o) => o.lifecycleStatus === 'draft').length,
    in_progress: clientOrders.filter((o) => o.lifecycleStatus === 'in_progress').length,
    paid: clientOrders.filter((o) => o.lifecycleStatus === 'paid').length,
    completed: clientOrders.filter((o) => o.lifecycleStatus === 'completed').length,
  };

  const filtered = clientOrders.filter((o) => o.lifecycleStatus === activeSubTab);

  const emptyMessages: Record<SubTab, string> = {
    draft: 'No draft orders. Create a client order to get started.',
    in_progress: 'No orders in progress.',
    paid: 'No paid orders yet.',
    completed: 'No completed orders.',
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSubTab === tab.key
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full ${
                  activeSubTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-gray-500">
          {emptyMessages[activeSubTab]}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Delivery</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Items</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-gray-900 font-medium">{order.clientName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString('en-US', { timeZone: 'UTC' })
                        : '--'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{order.itemCount}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {order.totalCents > 0 ? cents(order.totalCents) : '--'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge(order.lifecycleStatus)}`}>
                        {statusLabel(order.lifecycleStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/${order.shareCode}`}
                        className="text-sm text-brand-blue hover:underline font-medium"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{order.clientName}</div>
                    <div className="text-xs text-gray-500">{order.orderName}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge(order.lifecycleStatus)}`}>
                    {statusLabel(order.lifecycleStatus)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Created:</span>{' '}
                    <span className="text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Delivery:</span>{' '}
                    <span className="text-gray-700">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString('en-US', { timeZone: 'UTC' })
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items:</span>{' '}
                    <span className="text-gray-700">{order.itemCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>{' '}
                    <span className="text-gray-700 font-medium">
                      {order.totalCents > 0 ? cents(order.totalCents) : '--'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/${order.shareCode}`}
                  className="block text-center text-sm font-medium text-brand-blue hover:underline"
                >
                  Open Dashboard
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
