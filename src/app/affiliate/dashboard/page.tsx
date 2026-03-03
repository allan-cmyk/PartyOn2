'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AffiliateData {
  affiliate: {
    id: string;
    code: string;
    businessName: string;
    contactName: string;
    email: string;
  };
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

export default function AffiliateDashboardPage(): ReactElement {
  const router = useRouter();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/affiliate/me').then((r) => r.json()),
      fetch('/api/v1/affiliate/me/orders').then((r) => r.json()),
      fetch('/api/v1/affiliate/me/payouts').then((r) => r.json()),
    ])
      .then(([meRes, ordersRes, payoutsRes]) => {
        if (!meRes.success) {
          router.push('/affiliate/login');
          return;
        }
        setData(meRes.data);
        if (ordersRes.success) setOrders(ordersRes.data.orders);
        if (payoutsRes.success) setPayouts(payoutsRes.data);
      })
      .catch(() => router.push('/affiliate/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/v1/affiliate/logout', { method: 'POST' });
    router.push('/affiliate/login');
  };

  const handleCopy = () => {
    if (!data) return;
    const link = `${window.location.origin}/partners/${data.affiliate.code.toLowerCase()}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cents = (c: number) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      HELD: 'text-yellow-600', HELD_REVIEW: 'text-orange-600',
      APPROVED: 'text-blue-600', PAID: 'text-green-600', VOID: 'text-red-500',
    };
    return map[s] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) return <div />;

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://partyondelivery.com'}/partners/${data.affiliate.code.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-gray-900 text-lg">Party On</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{data.affiliate.contactName}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Referral Link */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Your Referral Link</h2>
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 break-all font-mono">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this link with your customers. They get free delivery on their order, and you earn commission.
          </p>
          <Link
            href="/affiliate/dashboard/create-dashboard"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Client Dashboard
          </Link>
        </div>

        {/* Month-to-Date Stats */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-4">This Year</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{data.yearToDate.orderCount}</div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{cents(data.yearToDate.revenueCents)}</div>
              <div className="text-xs text-gray-500">Referred Revenue</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{cents(data.yearToDate.commissionCents)}</div>
              <div className="text-xs text-gray-500">Commission Earned</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">{data.yearToDate.currentTier}</div>
              <div className="text-xs text-gray-500">Current Tier</div>
            </div>
          </div>
          {/* Tier progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20">Tier Progress</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all"
                style={{ width: `${data.yearToDate.tierProgressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10">{data.yearToDate.tierProgressPercent}%</span>
          </div>
        </div>

        {/* Lifetime Stats (compact) */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Lifetime</h2>
          <div className="flex gap-8 text-sm">
            <div><span className="text-gray-500">Revenue:</span> <span className="font-medium">{cents(data.lifetime.revenueCents)}</span></div>
            <div><span className="text-gray-500">Commission:</span> <span className="font-medium text-green-700">{cents(data.lifetime.commissionCents)}</span></div>
            <div><span className="text-gray-500">Orders:</span> <span className="font-medium">{data.lifetime.orderCount}</span></div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Orders</h2>
          {orders.length === 0 ? (
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
                        <span className={`text-xs font-medium ${
                          p.status === 'COMPLETED' ? 'text-green-600' :
                          p.status === 'PENDING' ? 'text-yellow-600' : 'text-red-500'
                        }`}>
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
