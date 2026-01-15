'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface CustomerTier {
  id: string;
  name: string;
  color: string;
}

interface CustomerLoyalty {
  points: number;
  lifetimeSpend: number;
  lifetimePoints: number;
  tier: CustomerTier;
}

interface Customer {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  acceptsMarketing: boolean;
  isActive: boolean;
  ageVerified: boolean;
  emailVerified: boolean;
  totalOrders: number;
  lastOrderAt: string | null;
  lastOrderTotal: number | null;
  loyalty: CustomerLoyalty | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface CustomersData {
  customers: Customer[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters: { loyaltyTiers: CustomerTier[] };
  summary: { total: number; active: number; withOrders: number };
}

/**
 * Operations Customers Management Page
 */
export default function CustomersPage() {
  const [data, setData] = useState<CustomersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [ordersFilter, setOrdersFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeFilter) params.set('isActive', activeFilter);
      if (ordersFilter) params.set('hasOrders', ordersFilter);
      if (tierFilter) params.set('loyaltyTier', tierFilter);
      params.set('page', page.toString());
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('limit', '20');

      const response = await fetch(`/api/v1/admin/customers?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter, ordersFilter, tierFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeFilter) params.set('isActive', activeFilter);
      if (ordersFilter) params.set('hasOrders', ordersFilter);
      if (tierFilter) params.set('loyaltyTier', tierFilter);
      params.set('limit', '1000');

      const response = await fetch(`/api/v1/admin/customers?${params}`);
      const result = await response.json();

      if (!result.success) return;

      const headers = ['Email', 'Name', 'Phone', 'Orders', 'Lifetime Spend', 'Tier', 'Points', 'Created'];
      const rows = result.data.customers.map((c: Customer) => [
        c.email,
        c.fullName,
        c.phone || '',
        c.totalOrders,
        c.loyalty?.lifetimeSpend || 0,
        c.loyalty?.tier.name || 'None',
        c.loyalty?.points || 0,
        formatDate(c.createdAt),
      ]);

      const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Customers</h1>
          <p className="text-gray-600 text-sm">
            Manage your customer database
          </p>
        </div>
        <button
          onClick={exportCustomers}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Total Customers</h3>
            <p className="text-2xl font-bold text-black">{data.summary.total}</p>
          </div>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Active Accounts</h3>
            <p className="text-2xl font-bold text-black">{data.summary.active}</p>
          </div>
          <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">With Orders</h3>
            <p className="text-2xl font-bold text-black">{data.summary.withOrders}</p>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={ordersFilter}
            onChange={(e) => { setOrdersFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Customers</option>
            <option value="true">With Orders</option>
            <option value="false">No Orders</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Tiers</option>
            {data?.filters.loyaltyTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>{tier.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
          >
            <option value="createdAt">Date Joined</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="totalOrders">Order Count</option>
            <option value="lifetimeSpend">Lifetime Spend</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
          {data && (
            <span className="ml-auto text-sm text-gray-500">
              {data.pagination.total} customer{data.pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : data?.customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No customers found matching your criteria.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Lifetime Spend</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Link href={`/ops/customers/${customer.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {customer.firstName?.[0] || customer.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-black hover:text-blue-600">
                            {customer.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {customer.loyalty ? (
                      <span
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${customer.loyalty.tier.color}20`,
                          color: customer.loyalty.tier.color,
                        }}
                      >
                        {customer.loyalty.tier.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No loyalty</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-medium text-black">{customer.totalOrders}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-medium text-black">
                      {customer.loyalty ? formatCurrency(customer.loyalty.lifetimeSpend) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-medium text-black">
                      {customer.loyalty?.points.toLocaleString() || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {customer.isActive ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      {customer.ageVerified && (
                        <span className="text-green-500" title="Age Verified">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-gray-600 text-sm">{formatDate(customer.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
              disabled={page === data.pagination.pages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
