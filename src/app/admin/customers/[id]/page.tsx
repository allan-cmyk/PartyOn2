'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Address {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

interface LoyaltyTransaction {
  id: string;
  type: string;
  points: number;
  description: string | null;
  createdAt: string;
}

interface OrderSummary {
  id: string;
  orderNumber: number;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  total: number;
  itemCount: number;
  deliveryDate: string;
  createdAt: string;
}

interface CustomerDetail {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  acceptsMarketing: boolean;
  isActive: boolean;
  ageVerified: boolean;
  ageVerifiedAt: string | null;
  dateOfBirth: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  shopifyId: string | null;
  stripeCustomerId: string | null;
  addresses: Address[];
  loyalty: {
    points: number;
    lifetimeSpend: number;
    lifetimePoints: number;
    tier: { id: string; name: string; color: string; discountPercent: number; pointsMultiplier: number; benefits: unknown };
    nextTier: { id: string; name: string; minSpend: number; spendNeeded: number } | null;
    recentTransactions: LoyaltyTransaction[];
  } | null;
  orders: OrderSummary[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
  createdAt: string;
  lastLoginAt: string | null;
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-red-100 text-red-800',
  UNFULFILLED: 'bg-yellow-100 text-yellow-800',
  FULFILLED: 'bg-green-100 text-green-800',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/v1/admin/customers/${id}`);
        const json = await res.json();
        if (json.success) {
          setCustomer(json.data);
        } else {
          setError(json.error || 'Customer not found');
        }
      } catch {
        setError('Failed to load customer');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCustomer();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <Link href="/admin/customers" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          &larr; Back to Customers
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">{error || 'Customer not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back link */}
      <Link href="/admin/customers" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to Customers
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">
              {customer.firstName?.[0] || customer.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">{customer.fullName}</h1>
            <p className="text-gray-500">{customer.email}</p>
            {customer.phone && <p className="text-gray-500 text-sm">{customer.phone}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {customer.isActive ? (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Active</span>
          ) : (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>
          )}
          {customer.ageVerified && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">Age Verified</span>
          )}
          {customer.emailVerified && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">Email Verified</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Orders</h3>
          <p className="text-2xl font-bold text-black">{customer.stats.totalOrders}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-black">{formatCurrency(customer.stats.totalSpent)}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Avg Order Value</h3>
          <p className="text-2xl font-bold text-black">{formatCurrency(customer.stats.averageOrderValue)}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Loyalty Points</h3>
          <p className="text-2xl font-bold text-black">{customer.loyalty?.points.toLocaleString() || '0'}</p>
          {customer.loyalty && (
            <p className="text-xs mt-1" style={{ color: customer.loyalty.tier.color }}>
              {customer.loyalty.tier.name} Tier
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Addresses */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-black mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Customer since</dt>
                <dd className="text-black font-medium">{formatDate(customer.createdAt)}</dd>
              </div>
              {customer.lastLoginAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last login</dt>
                  <dd className="text-black font-medium">{formatDateTime(customer.lastLoginAt)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Marketing</dt>
                <dd className="text-black font-medium">{customer.acceptsMarketing ? 'Subscribed' : 'Not subscribed'}</dd>
              </div>
              {customer.ageVerifiedAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Age verified</dt>
                  <dd className="text-black font-medium">{formatDate(customer.ageVerifiedAt)}</dd>
                </div>
              )}
              {customer.stripeCustomerId && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Stripe ID</dt>
                  <dd className="text-black font-mono text-xs">{customer.stripeCustomerId}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Addresses */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-black mb-4">
              Addresses ({customer.addresses.length})
            </h2>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-gray-500">No addresses on file.</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    {addr.isDefault && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded mb-2">
                        Default
                      </span>
                    )}
                    <p className="text-black">
                      {[addr.firstName, addr.lastName].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-gray-600">{addr.address1}</p>
                    {addr.address2 && <p className="text-gray-600">{addr.address2}</p>}
                    <p className="text-gray-600">
                      {addr.city}, {addr.province} {addr.zip}
                    </p>
                    {addr.phone && <p className="text-gray-500 mt-1">{addr.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loyalty Progress */}
          {customer.loyalty?.nextTier && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-black mb-4">Loyalty Progress</h2>
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span style={{ color: customer.loyalty.tier.color }} className="font-medium">
                    {customer.loyalty.tier.name}
                  </span>
                  <span className="text-gray-500">{customer.loyalty.nextTier.name}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: customer.loyalty.tier.color,
                      width: `${Math.min(100, ((customer.loyalty.lifetimeSpend) / customer.loyalty.nextTier.minSpend) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-gray-500 text-xs">
                  {formatCurrency(customer.loyalty.nextTier.spendNeeded)} more to reach {customer.loyalty.nextTier.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Orders & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-black mb-4">
              Recent Orders ({customer.stats.totalOrders})
            </h2>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <span className="font-medium text-black">PO-{order.orderNumber}</span>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.financialStatus] || 'bg-gray-100 text-gray-800'}`}>
                            {order.financialStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-gray-600">{order.itemCount}</td>
                        <td className="px-3 py-3 text-right font-medium text-black">{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Loyalty Transactions */}
          {customer.loyalty && customer.loyalty.recentTransactions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-black mb-4">Loyalty Transactions</h2>
              <div className="space-y-2">
                {customer.loyalty.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-black">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <span className={`font-medium text-sm ${tx.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.points >= 0 ? '+' : ''}{tx.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
