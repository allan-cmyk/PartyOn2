'use client';

import { useState, useEffect, useMemo, type ReactElement } from 'react';
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

type Category = 'draft' | 'inProcess' | 'paid' | 'completed';

interface CategorizedOrders {
  draft: DashboardOrder[];
  inProcess: DashboardOrder[];
  paid: DashboardOrder[];
  completed: DashboardOrder[];
}

const CATEGORY_META: Record<Category, { label: string; badgeColor: string }> = {
  draft: { label: 'Draft', badgeColor: 'bg-gray-100 text-gray-700' },
  inProcess: { label: 'In Process', badgeColor: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', badgeColor: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', badgeColor: 'bg-blue-100 text-blue-800' },
};

function categorizeOrders(orders: DashboardOrder[]): CategorizedOrders {
  const now = new Date();
  const result: CategorizedOrders = { draft: [], inProcess: [], paid: [], completed: [] };

  for (const order of orders) {
    const isClosed = order.status === 'CLOSED' || order.status === 'COMPLETED' || order.status === 'CANCELLED';
    const deliveryPast = order.deliveryDate ? new Date(order.deliveryDate) < now : false;

    if (isClosed || deliveryPast) {
      result.completed.push(order);
    } else if (order.purchasedItemCount > 0) {
      result.paid.push(order);
    } else if (order.viewCount > 0) {
      result.inProcess.push(order);
    } else {
      result.draft.push(order);
    }
  }

  return result;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

function OrderRow({ order, copiedId, onCopyLink }: {
  order: DashboardOrder;
  copiedId: string | null;
  onCopyLink: (order: DashboardOrder) => void;
}) {
  return (
    <tr className="hover:bg-gray-50">
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
            onClick={() => onCopyLink(order)}
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
  );
}

function OrderSection({ category, orders, copiedId, onCopyLink }: {
  category: Category;
  orders: DashboardOrder[];
  copiedId: string | null;
  onCopyLink: (order: DashboardOrder) => void;
}) {
  if (orders.length === 0) return null;
  const meta = CATEGORY_META[category];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 px-1">
        <h2 className="text-sm font-semibold text-gray-700">{meta.label}</h2>
        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${meta.badgeColor}`}>
          {orders.length}
        </span>
      </div>
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
                <OrderRow key={order.id} order={order} copiedId={copiedId} onCopyLink={onCopyLink} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PartnerOrdersPage(): ReactElement {
  const router = useRouter();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

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

  const categorized = useMemo(() => categorizeOrders(orders), [orders]);

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

  const activeCategories: Category[] = ['draft', 'inProcess', 'paid'];
  const hasActiveOrders = activeCategories.some((c) => categorized[c].length > 0);
  const completedCount = categorized.completed.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-[0.04em] text-gray-900">
              Client Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Client orders you&apos;ve created
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
              Create Order
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
              Create Your First Client Order
            </Link>
          </div>
        ) : (
          <>
            {activeCategories.map((category) => (
              <OrderSection
                key={category}
                category={category}
                orders={categorized[category]}
                copiedId={copiedId}
                onCopyLink={handleCopyLink}
              />
            ))}

            {!hasActiveOrders && completedCount === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-base text-gray-500">No orders yet</p>
              </div>
            )}

            {completedCount > 0 && (
              <>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {showCompleted ? 'Hide' : 'Show'} completed ({completedCount})
                </button>
                {showCompleted && (
                  <OrderSection
                    category="completed"
                    orders={categorized.completed}
                    copiedId={copiedId}
                    onCopyLink={handleCopyLink}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
