'use client';

import { useState, useEffect, ReactElement } from 'react';
import { format, parseISO } from 'date-fns';
import { OrderForDisplay } from '@/app/api/admin/orders/route';

type FilterStatus = 'all' | 'unfulfilled' | 'fulfilled';

export default function AdminOrdersPage(): ReactElement {
  const [orders, setOrders] = useState<OrderForDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderForDisplay | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/orders?limit=100');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filterStatus === 'unfulfilled' && order.fulfillmentStatus !== 'unfulfilled') {
      return false;
    }
    if (filterStatus === 'fulfilled' && order.fulfillmentStatus === 'unfulfilled') {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unfulfilled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'fulfilled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Fulfilled
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Partial
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handlePrintOrder = (orderNumber: string) => {
    const num = orderNumber.replace('#', '');
    window.open(`/admin/order-sheet/${num}`, '_blank');
  };

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-56px)]">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Orders</option>
                <option value="unfulfilled">Pending</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
              {/* Refresh */}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Refresh"
              >
                <svg
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-32 bg-gray-200 rounded" />
                  <div className="flex-1" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {/* Order Header - Always visible */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder?.id === order.id ? null : order
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.fulfillmentStatus)}
                        <span className="text-gray-500 text-sm">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {order.deliveryDate && (
                          <span className="text-sm text-gray-600">
                            📅 {order.deliveryDate} {order.deliveryTime}
                          </span>
                        )}
                        <span className="font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedOrder?.id === order.id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Order Details - Expanded */}
                  {selectedOrder?.id === order.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Customer
                          </h4>
                          <p className="text-sm text-gray-900 font-medium">
                            {order.customerName}
                          </p>
                          {order.customerEmail && (
                            <p className="text-sm text-gray-600">
                              {order.customerEmail}
                            </p>
                          )}
                          {order.customerPhone && (
                            <p className="text-sm text-gray-600">
                              📞 {order.customerPhone}
                            </p>
                          )}
                        </div>

                        {/* Delivery Info */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Delivery
                          </h4>
                          <p className="text-sm text-gray-900">
                            {order.deliveryAddress}
                          </p>
                          {order.deliveryDate && (
                            <p className="text-sm text-gray-600 mt-1">
                              {order.deliveryDate} @ {order.deliveryTime}
                            </p>
                          )}
                        </div>

                        {/* Order Info */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Order Details
                          </h4>
                          <p className="text-sm text-gray-600">
                            Ordered:{' '}
                            {format(parseISO(order.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Items: {order.items.length}
                          </p>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Items
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-700 truncate">
                                {item.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Notes
                          </h4>
                          <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                            {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                        <button
                          onClick={() => handlePrintOrder(order.orderNumber)}
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                        >
                          Print Order Sheet
                        </button>
                        {order.customerPhone && (
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Call Customer
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  );
}
