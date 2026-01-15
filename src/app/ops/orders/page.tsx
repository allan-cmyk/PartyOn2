'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import Link from 'next/link';

interface OrderCustomer {
  id: string;
  email: string;
  name: string;
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

/**
 * Operations Orders Management Page
 */
export default function OrdersPage(): ReactElement {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('');
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
  }, [search, statusFilter, fulfillmentFilter, deliveryTypeFilter, page, sortBy, sortOrder]);

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
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFulfillmentColor = (status: string): string => {
    switch (status) {
      case 'FULFILLED':
        return 'bg-green-100 text-green-800';
      case 'UNFULFILLED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Orders</h1>
          <p className="text-gray-600 text-sm">
            Manage and track all customer orders
          </p>
        </div>
        <button
          onClick={exportOrders}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-black">{data.summary.total}</p>
          </div>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-black">{formatCurrency(data.summary.totalRevenue)}</p>
          </div>
          <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Today&apos;s Orders</h3>
            <p className="text-2xl font-bold text-black">{data.summary.todayOrders}</p>
          </div>
          <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Today&apos;s Revenue</h3>
            <p className="text-2xl font-bold text-black">{formatCurrency(data.summary.todayRevenue)}</p>
          </div>
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Pending Fulfillment</h3>
            <p className="text-2xl font-bold text-black">{data.summary.pendingFulfillment}</p>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by order #, customer name, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Statuses</option>
            {data?.filters.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Fulfillment</option>
            {data?.filters.fulfillmentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={deliveryTypeFilter}
            onChange={(e) => { setDeliveryTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Delivery Types</option>
            {data?.filters.deliveryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
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
            <option value="createdAt">Order Date</option>
            <option value="orderNumber">Order Number</option>
            <option value="total">Total Amount</option>
            <option value="deliveryDate">Delivery Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
          {data && (
            <span className="ml-auto text-sm text-gray-500">
              {data.pagination.total} order{data.pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-16 h-6 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Delivery</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Link href={`/ops/orders/${order.id}`} className="block">
                      <span className="font-mono font-bold text-blue-600 hover:text-blue-800">
                        #{order.orderNumber}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-black">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-medium text-black">{order.itemCount}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-black">{formatCurrency(order.total)}</span>
                    {order.discountCode && (
                      <p className="text-xs text-green-600">-{formatCurrency(order.discountAmount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFulfillmentColor(order.fulfillmentStatus)}`}>
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-black">{formatDate(order.deliveryDate)}</p>
                      <p className="text-xs text-gray-500">{order.deliveryTime}</p>
                      <p className="text-xs text-gray-400">{order.deliveryType}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-gray-600 text-sm">{formatDateTime(order.createdAt)}</span>
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
