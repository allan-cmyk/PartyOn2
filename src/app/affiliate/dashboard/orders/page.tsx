'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardOrder {
  id: string;
  name: string;
  shareCode: string;
  status: string;
  hostName: string;
  hostEmail: string | null;
  hostPhone: string | null;
  partyType: string | null;
  source: string;
  draftItemCount: number;
  purchasedItemCount: number;
  totalRevenue: number;
  viewCount: number;
  tabCount: number;
  deliveryDate: string | null;
  dashboardUrl: string;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function PartnerOrdersPage(): ReactElement {
  const router = useRouter();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/v1/affiliate/dashboard-orders');
        if (res.status === 401) {
          router.push('/affiliate/dashboard');
          return;
        }
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setOrders(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [router]);

  function handleCopyLink(order: DashboardOrder) {
    navigator.clipboard.writeText(order.dashboardUrl);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-[0.04em] text-gray-900">
              Client Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Orders created through your partner dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/affiliate/dashboard"
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/affiliate/dashboard/create-dashboard"
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-base text-gray-500 mb-4">No orders yet</p>
            <Link
              href="/affiliate/dashboard/create-dashboard"
              className="inline-flex px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Order Name</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Delivery</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Items</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">Views</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{order.name}</p>
                        <p className="text-xs text-gray-500">
                          {order.hostName}
                          {order.tabCount > 1 && (
                            <span className="ml-1 text-gray-400">
                              ({order.tabCount} tabs)
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })
                          : '--'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.draftItemCount + order.purchasedItemCount}
                        {order.purchasedItemCount > 0 && (
                          <span className="text-green-600 ml-1">({order.purchasedItemCount} paid)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ${order.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {order.viewCount > 0 ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                            POD: {order.viewCount}x
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(order)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-colors"
                          >
                            {copiedId === order.id ? 'Copied!' : 'Copy Link'}
                          </button>
                          <a
                            href={order.dashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-brand-blue hover:text-blue-700"
                          >
                            Open
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
