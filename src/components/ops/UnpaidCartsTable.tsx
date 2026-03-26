'use client';

import React, { useState, useEffect, useCallback, useRef, ReactElement } from 'react';

interface CartItem {
  title: string;
  quantity: number;
  price: number;
}

interface UnpaidCart {
  id: string;
  name: string;
  shareCode: string;
  status: string;
  hostName: string;
  hostEmail: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  participantCount: number;
  unpaidItemCount: number;
  unpaidTotal: number;
  paidItemCount: number;
  items: CartItem[];
  createdAt: string;
  expiresAt: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200';
    case 'CLOSED':
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300';
    case 'COMPLETED':
      return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200';
    case 'CANCELLED':
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200';
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function UnpaidCartsTable(): ReactElement {
  const [carts, setCarts] = useState<UnpaidCart[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/v1/admin/unpaid-carts?${params}`);
      const result = await response.json();
      if (result.success) {
        setCarts(result.data.carts);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch unpaid carts:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  if (loading && carts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by host, email, or share code..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {pagination && (
          <span className="text-sm text-gray-500 ml-auto">
            {pagination.total} cart{pagination.total !== 1 ? 's' : ''} with unpaid items
          </span>
        )}
      </div>

      {carts.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-gray-700 text-xl font-semibold mt-4">No unpaid carts found</p>
          <p className="text-gray-500 mt-2">All dashboard orders have been paid or no carts match your filters</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboard</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Host</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carts.map((cart) => (
                  <React.Fragment key={cart.id}>
                    <tr
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === cart.id ? null : cart.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-medium text-blue-600">{cart.shareCode}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{cart.name || 'Untitled'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{cart.hostName}</div>
                        {cart.hostEmail && (
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">{cart.hostEmail}</div>
                        )}
                        {cart.participantCount > 1 && (
                          <div className="text-xs text-gray-400">{cart.participantCount} participants</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-orange-600">{cart.unpaidItemCount} unpaid</div>
                        {cart.paidItemCount > 0 && (
                          <div className="text-xs text-green-600">{cart.paidItemCount} paid</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(cart.unpaidTotal)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(cart.status)}`}>
                          {cart.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cart.deliveryDate ? (
                          <>
                            <div>{formatDate(cart.deliveryDate)}</div>
                            {cart.deliveryTime && <div className="text-xs text-gray-400">{cart.deliveryTime}</div>}
                          </>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(cart.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/dashboard/${cart.shareCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View
                        </a>
                      </td>
                    </tr>
                    {expandedRow === cart.id && cart.items.length > 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 bg-orange-50/50">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Unpaid Items</div>
                          <div className="grid gap-1">
                            {cart.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">
                                  <span className="font-medium text-orange-700">x{item.quantity}</span>{' '}
                                  {item.title}
                                </span>
                                <span className="text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {carts.map((cart) => (
              <div key={cart.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm font-medium text-blue-600">{cart.shareCode}</div>
                    <div className="text-sm font-medium text-gray-900">{cart.hostName}</div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClasses(cart.status)}`}>
                    {cart.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-orange-600">{cart.unpaidItemCount} unpaid items</span>
                  <span className="font-bold text-gray-900">{formatCurrency(cart.unpaidTotal)}</span>
                </div>
                {cart.deliveryDate && (
                  <div className="text-sm text-gray-500 mb-2">
                    Delivery: {formatDate(cart.deliveryDate)} {cart.deliveryTime || ''}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Created {formatDateTime(cart.createdAt)}</span>
                  <a
                    href={`/dashboard/${cart.shareCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg"
                  >
                    View Dashboard
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
