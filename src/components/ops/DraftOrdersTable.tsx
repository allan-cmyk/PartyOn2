'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import Link from 'next/link';
import InvoiceSendModal from './InvoiceSendModal';

interface DraftOrderItem {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface DraftOrder {
  id: string;
  token: string;
  status: string;
  customerEmail: string;
  customerName: string;
  deliveryDate: string;
  deliveryTime: string;
  items: DraftOrderItem[];
  subtotal: number | string;
  total: number | string;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  invoiceUrl?: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const STATUS_OPTIONS = ['', 'PENDING', 'SENT', 'VIEWED', 'PAID', 'EXPIRED', 'CANCELLED'] as const;

const STATUS_LABELS: Record<string, string> = {
  '': 'All Statuses',
  PENDING: 'Pending',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  PAID: 'Paid',
  CONVERTED: 'Converted',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200';
    case 'SENT':
      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200';
    case 'VIEWED':
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200';
    case 'PAID':
    case 'CONVERTED':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200';
    case 'EXPIRED':
    case 'CANCELLED':
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200';
  }
}

function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export default function DraftOrdersTable(): ReactElement {
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sendModalOrder, setSendModalOrder] = useState<DraftOrder | null>(null);
  const limit = 20;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchDraftOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());
      params.set('orderBy', 'createdAt');
      params.set('order', 'desc');

      const response = await fetch(`/api/v1/admin/draft-orders?${params}`);
      const result = await response.json();
      if (result.success) {
        setDraftOrders(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch draft orders:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => {
    fetchDraftOrders();
  }, [fetchDraftOrders]);

  const handleOpenSendModal = (order: DraftOrder) => {
    setSendModalOrder(order);
  };

  const handleSendModalSuccess = () => {
    setSendModalOrder(null);
    showToast('Invoice sent');
    fetchDraftOrders();
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this draft order? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      const response = await fetch(`/api/v1/admin/draft-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const result = await response.json();
      if (result.success) {
        showToast('Draft order cancelled');
        fetchDraftOrders();
      } else {
        alert('Failed to cancel: ' + (result.error || 'Unknown error'));
      }
    } catch {
      alert('Failed to cancel draft order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/invoice/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied');
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('Link copied');
    }
  };

  const handleCopyEmail = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/v1/admin/draft-orders/${id}/preview`);
      const result = await response.json();
      if (!result.success) {
        alert('Failed to get email preview');
        return;
      }
      const blob = new Blob([result.html], { type: 'text/html' });
      const item = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([item]);
      showToast('Email copied to clipboard');
    } catch {
      alert('Failed to copy email. Your browser may not support rich text clipboard.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (token: string) => {
    window.open(`/invoice/${token}`, '_blank');
  };

  const canSend = (status: string) => !['PAID', 'CONVERTED', 'CANCELLED', 'EXPIRED'].includes(status);
  const canCancel = (status: string) => !['PAID', 'CONVERTED', 'CANCELLED'].includes(status);

  const totalPages = pagination ? Math.ceil(pagination.total / limit) : 0;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      {/* Send Modal */}
      {sendModalOrder && (
        <InvoiceSendModal
          draftOrder={sendModalOrder}
          onClose={() => setSendModalOrder(null)}
          onSent={handleSendModalSuccess}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer transition-all duration-200 hover:border-gray-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
            ))}
          </select>
          {pagination && (
            <span className="ml-auto text-sm text-gray-500">
              {pagination.total} invoice{pagination.total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3" />
                  </div>
                  <div className="w-20 h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                  <div className="w-28 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : draftOrders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-xl font-semibold">No invoices found</p>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              {statusFilter
                ? 'Try changing the status filter'
                : 'Create an invoice to get started'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Delivery</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Sent</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {draftOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</p>
                      <p className="text-sm text-gray-500">{order.deliveryTime}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusBadgeClasses(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.sentAt ? (
                      <span className="text-sm text-gray-700">{formatDateTime(order.sentAt)}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Not sent</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {canSend(order.status) && (
                        <Link
                          href={`/ops/orders/${order.id}/edit`}
                          className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Edit invoice details"
                        >
                          Edit
                        </Link>
                      )}
                      {canSend(order.status) && (
                        <button
                          onClick={() => handleOpenSendModal(order)}
                          disabled={actionLoading === order.id}
                          className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                          title="Edit and send invoice email"
                        >
                          Edit & Send
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyLink(order.token)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy invoice link"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleCopyEmail(order.id)}
                        disabled={actionLoading === order.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                        title="Copy email HTML to clipboard"
                      >
                        Copy Email
                      </button>
                      <button
                        onClick={() => handleView(order.token)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        title="View invoice in new tab"
                      >
                        View
                      </button>
                      {canCancel(order.status) && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={actionLoading === order.id}
                          className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Cancel draft order"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="group px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={!pagination?.hasMore}
              className="group px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              Next
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
