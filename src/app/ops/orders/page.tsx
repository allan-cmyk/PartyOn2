'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import Link from 'next/link';

interface OrderCustomer {
  id: string;
  email: string;
  name: string;
}

interface GroupOrderInfo {
  id: string;
  shareCode: string;
  name: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customer: OrderCustomer;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: string;
  createdAt: string;
  groupOrderId: string | null;
  groupOrder: GroupOrderInfo | null;
}

interface OrdersData {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters: {
    statuses: string[];
    financialStatuses: string[];
    fulfillmentStatuses: string[];
    deliveryTypes: string[];
  };
  summary: {
    total: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    pendingFulfillment: number;
  };
}

// Stats card component for consistent styling
function StatCard({
  title,
  value,
  color = 'blue',
  icon
}: {
  title: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'indigo' | 'yellow' | 'orange';
  icon?: ReactElement;
}): ReactElement {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    yellow: 'from-amber-500 to-amber-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Filter button component
function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): ReactElement {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

export default function OrdersPage(): ReactElement {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('');
  const [groupTypeFilter, setGroupTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (fulfillmentFilter) params.set('fulfillmentStatus', fulfillmentFilter);
      if (deliveryTypeFilter) params.set('deliveryType', deliveryTypeFilter);
      if (groupTypeFilter) params.set('groupType', groupTypeFilter);
      params.set('page', page.toString());
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('limit', '20');

      const response = await fetch(`/api/v1/admin/orders?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, fulfillmentFilter, deliveryTypeFilter, groupTypeFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchOrders]);

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

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getFulfillmentColor = (status: string): string => {
    switch (status) {
      case 'FULFILLED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'UNFULFILLED':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const exportOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (fulfillmentFilter) params.set('fulfillmentStatus', fulfillmentFilter);
      if (deliveryTypeFilter) params.set('deliveryType', deliveryTypeFilter);
      params.set('limit', '1000');

      const response = await fetch(`/api/v1/admin/orders?${params}`);
      const result = await response.json();

      if (!result.success) return;

      const headers = ['Order #', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Fulfillment', 'Delivery Date', 'Created'];
      const rows = result.data.orders.map((o: Order) => [
        o.orderNumber,
        o.customerName,
        o.customerEmail,
        o.itemCount,
        o.total.toFixed(2),
        o.status,
        o.fulfillmentStatus,
        formatDate(o.deliveryDate),
        formatDateTime(o.createdAt),
      ]);

      const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={exportOrders}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Orders"
            value={data.summary.total.toLocaleString()}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.summary.totalRevenue)}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Today's Orders"
            value={data.summary.todayOrders}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(data.summary.todayRevenue)}
            color="indigo"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            title="Pending Fulfillment"
            value={data.summary.pendingFulfillment}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order #, customer name, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            {data?.filters.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Fulfillment</option>
            {data?.filters.fulfillmentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={deliveryTypeFilter}
            onChange={(e) => { setDeliveryTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Delivery Types</option>
            {data?.filters.deliveryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Group Order Filter */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Order type:</span>
          <div className="flex gap-2">
            <FilterButton active={groupTypeFilter === ''} onClick={() => { setGroupTypeFilter(''); setPage(1); }}>
              All
            </FilterButton>
            <FilterButton active={groupTypeFilter === 'regular'} onClick={() => { setGroupTypeFilter('regular'); setPage(1); }}>
              Regular
            </FilterButton>
            <FilterButton active={groupTypeFilter === 'group'} onClick={() => { setGroupTypeFilter('group'); setPage(1); }}>
              Group Orders
            </FilterButton>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex gap-2">
            <FilterButton active={sortBy === 'createdAt'} onClick={() => setSortBy('createdAt')}>
              Date
            </FilterButton>
            <FilterButton active={sortBy === 'orderNumber'} onClick={() => setSortBy('orderNumber')}>
              Order #
            </FilterButton>
            <FilterButton active={sortBy === 'total'} onClick={() => setSortBy('total')}>
              Amount
            </FilterButton>
            <FilterButton active={sortBy === 'deliveryDate'} onClick={() => setSortBy('deliveryDate')}>
              Delivery
            </FilterButton>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            {sortOrder === 'asc' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Ascending
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Descending
              </>
            )}
          </button>
          {data && (
            <span className="ml-auto text-sm text-gray-500">
              {data.pagination.total} order{data.pagination.total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-20 h-8 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="w-24 h-6 bg-gray-200 rounded-full" />
                  <div className="w-20 h-6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg">No orders found matching your criteria</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fulfillment</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.orders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/ops/orders/${order.id}`} className="block">
                      <span className="font-mono font-bold text-blue-600 group-hover:text-blue-700 text-lg">
                        #{order.orderNumber}
                      </span>
                    </Link>
                    {order.groupOrder && (
                      <Link
                        href={`/ops/group-orders/${order.groupOrder.id}`}
                        className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                        title={`Part of "${order.groupOrder.name}"`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {order.groupOrder.shareCode}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-semibold text-gray-700">
                      {order.itemCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</span>
                    {order.discountCode && (
                      <p className="text-xs text-green-600 font-medium">-{formatCurrency(order.discountAmount)} ({order.discountCode})</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getFulfillmentColor(order.fulfillmentStatus)}`}>
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</p>
                      <p className="text-sm text-gray-500">{order.deliveryTime}</p>
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded mt-1">
                        {order.deliveryType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-gray-500 text-sm">{formatDateTime(order.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                let pageNum = i + 1;
                if (data.pagination.pages > 5) {
                  if (page <= 3) pageNum = i + 1;
                  else if (page >= data.pagination.pages - 2) pageNum = data.pagination.pages - 4 + i;
                  else pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
              disabled={page === data.pagination.pages}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
