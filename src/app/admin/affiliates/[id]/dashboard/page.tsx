'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AffiliateInfo {
  id: string;
  code: string;
  businessName: string;
  contactName: string;
  email: string;
}

interface YearToDate {
  revenueCents: number;
  commissionCents: number;
  orderCount: number;
  currentTier: string;
  tierProgressPercent: number;
}

interface Lifetime {
  revenueCents: number;
  commissionCents: number;
  orderCount: number;
}

interface OrderItem {
  orderId: string;
  orderNumber: number;
  customerName: string;
  orderDate: string;
  subtotalCents: number;
  commissionCents: number;
  commissionRate: number;
  tier: string;
  status: string;
}

interface PayoutItem {
  id: string;
  payoutPeriod: string;
  totalAmountCents: number;
  status: string;
  processedAt: string | null;
  _count: { commissions: number };
}

interface DashboardOrder {
  id: string;
  name: string;
  shareCode: string;
  status: string;
  hostName: string;
  partyType: string | null;
  draftItemCount: number;
  purchasedItemCount: number;
  totalRevenue: number;
  viewCount: number;
  tabCount: number;
  deliveryDate: string | null;
  dashboardUrl: string;
  createdAt: string;
}

interface DashboardData {
  affiliate: AffiliateInfo;
  yearToDate: YearToDate;
  lifetime: Lifetime;
  orders: OrderItem[];
  payouts: PayoutItem[];
  dashboardOrders: DashboardOrder[];
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AdminAffiliateDashboardPage(): ReactElement {
  const params = useParams();
  const affiliateId = params.id as string;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/affiliates/${affiliateId}/dashboard`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [affiliateId]);

  const cents = (c: number) =>
    `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      HELD: 'text-yellow-600',
      HELD_REVIEW: 'text-orange-600',
      APPROVED: 'text-blue-600',
      PAID: 'text-green-600',
      VOID: 'text-red-500',
    };
    return map[s] || 'text-gray-600';
  };

  function handleCopyLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-red-600">{error || 'No data'}</p>
        <Link href="/admin/affiliates" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Back to Affiliates
        </Link>
      </div>
    );
  }

  const { affiliate, yearToDate, lifetime, orders, payouts, dashboardOrders } = data;
  const referralLink = `https://partyondelivery.com/partners/${affiliate.code.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      <div className="bg-gray-900 text-white px-4 py-2 text-sm flex items-center justify-between">
        <span>
          Admin View: <strong>{affiliate.businessName}</strong> ({affiliate.contactName} &mdash; {affiliate.email})
        </span>
        <div className="flex items-center gap-3">
          <Link href={`/admin/affiliates/${affiliate.id}`} className="text-blue-300 hover:text-blue-200 text-xs font-medium">
            Edit Affiliate
          </Link>
          <Link href="/admin/affiliates" className="text-gray-400 hover:text-gray-200 text-xs font-medium">
            All Affiliates
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Referral Link */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Referral Link</h2>
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 break-all font-mono">
              {referralLink}
            </div>
            <button
              onClick={() => handleCopyLink(referralLink, 'referral')}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
            >
              {copiedId === 'referral' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* YTD Stats */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-4">This Year</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{yearToDate.orderCount}</div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{cents(yearToDate.revenueCents)}</div>
              <div className="text-xs text-gray-500">Referred Revenue</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{cents(yearToDate.commissionCents)}</div>
              <div className="text-xs text-gray-500">Commission Earned</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{yearToDate.currentTier}</div>
              <div className="text-xs text-gray-500">Current Tier</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20">Tier Progress</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all"
                style={{ width: `${yearToDate.tierProgressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10">{yearToDate.tierProgressPercent}%</span>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Lifetime</h2>
          <div className="flex gap-8 text-sm">
            <div>
              <span className="text-gray-500">Revenue:</span>{' '}
              <span className="font-medium">{cents(lifetime.revenueCents)}</span>
            </div>
            <div>
              <span className="text-gray-500">Commission:</span>{' '}
              <span className="font-medium text-green-700">{cents(lifetime.commissionCents)}</span>
            </div>
            <div>
              <span className="text-gray-500">Orders:</span>{' '}
              <span className="font-medium">{lifetime.orderCount}</span>
            </div>
          </div>
        </div>

        {/* Client Dashboards */}
        {dashboardOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Client Dashboards</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-2 text-left font-medium text-gray-600">Order Name</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Status</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Delivery</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Items</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Revenue</th>
                    <th className="pb-2 text-center font-medium text-gray-600">Views</th>
                    <th className="pb-2 text-right font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-2">
                        <p className="font-medium text-gray-900">{order.name}</p>
                        <p className="text-xs text-gray-500">
                          {order.hostName}
                          {order.tabCount > 1 && (
                            <span className="ml-1 text-gray-400">({order.tabCount} tabs)</span>
                          )}
                        </p>
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })
                          : '--'}
                      </td>
                      <td className="py-2 text-gray-600">
                        {order.draftItemCount + order.purchasedItemCount}
                        {order.purchasedItemCount > 0 && (
                          <span className="text-green-600 ml-1">({order.purchasedItemCount} paid)</span>
                        )}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        ${order.totalRevenue.toFixed(2)}
                      </td>
                      <td className="py-2 text-center">
                        {order.viewCount > 0 ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                            {order.viewCount}x
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleCopyLink(order.dashboardUrl, order.id)}
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

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-2 text-left font-medium text-gray-600">Date</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Order</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Subtotal</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Commission</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.orderId}>
                      <td className="py-2 text-gray-700">{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td className="py-2 text-gray-700">PO-{o.orderNumber}</td>
                      <td className="py-2 text-right text-gray-700">{cents(o.subtotalCents)}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{cents(o.commissionCents)}</td>
                      <td className={`py-2 text-xs font-medium ${statusColor(o.status)}`}>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Payout History</h2>
          {payouts.length === 0 ? (
            <p className="text-sm text-gray-500">No payouts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-2 text-left font-medium text-gray-600">Period</th>
                    <th className="pb-2 text-center font-medium text-gray-600">Orders</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Amount</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 text-gray-700">{p.payoutPeriod}</td>
                      <td className="py-2 text-center text-gray-700">{p._count.commissions}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{cents(p.totalAmountCents)}</td>
                      <td className="py-2">
                        <span
                          className={`text-xs font-medium ${
                            p.status === 'COMPLETED'
                              ? 'text-green-600'
                              : p.status === 'PENDING'
                                ? 'text-yellow-600'
                                : 'text-red-500'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
