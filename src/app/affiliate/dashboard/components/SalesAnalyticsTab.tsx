'use client';

import { ReactElement } from 'react';
import MonthlyRevenueChart from './MonthlyRevenueChart';

interface MonthStat {
  month: string;
  label: string;
  revenueCents: number;
  commissionCents: number;
  orderCount: number;
}

interface OrderItem {
  orderId: string;
  orderNumber: number;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
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

interface SalesAnalyticsTabProps {
  yearToDate: {
    revenueCents: number;
    commissionCents: number;
    orderCount: number;
    currentTier: string;
    tierProgressPercent: number;
  };
  lifetime: {
    revenueCents: number;
    commissionCents: number;
    orderCount: number;
  };
  monthlyStats: MonthStat[];
  commissionOrders: OrderItem[];
  payouts: PayoutItem[];
}

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

export default function SalesAnalyticsTab({
  yearToDate,
  lifetime,
  monthlyStats,
  commissionOrders,
  payouts,
}: SalesAnalyticsTabProps): ReactElement {
  return (
    <div className="space-y-6">
      {/* YTD Stats Grid */}
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

      {/* Monthly Chart */}
      <MonthlyRevenueChart data={monthlyStats} />

      {/* Lifetime Stats */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Lifetime</h2>
        <div className="flex flex-wrap gap-6 text-sm">
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

      {/* Commission Orders */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Commission Orders</h2>
        {commissionOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet. Share your referral link to get started!</p>
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
                {commissionOrders.map((o) => (
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
          <p className="text-sm text-gray-500">No payouts yet. Payouts are processed monthly.</p>
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
  );
}
