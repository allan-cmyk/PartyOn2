'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Host {
  id?: string;
  name: string | null;
  email?: string;
  phone?: string | null;
}

interface Participant {
  id: string;
  customerId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  name: string | null;
  email: string | null;
  cartTotal: number;
  itemCount: number;
  status: string;
  joinedAt: string;
  checkedOutAt: string | null;
  shopifyOrderId: string | null;
  shopifyOrderName: string | null;
}

interface OrderItem {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface GroupSubOrder {
  id: string;
  orderNumber: number;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
}

interface GroupOrderSummary {
  participantCount: number;
  orderCount: number;
  totalOrderValue: number;
  totalItems: number;
  checkedOutCount: number;
}

interface GroupOrderDetail {
  id: string;
  name: string;
  shareCode: string;
  status: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: {
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  minimumOrderAmount: number;
  expiresAt: string;
  createdAt: string;
  host: Host;
  participants: Participant[];
  orders: GroupSubOrder[];
  summary: GroupOrderSummary;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'LOCKED':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'CANCELLED':
    case 'CLOSED':
      return 'bg-red-100 text-red-700 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
}

function getParticipantStatusColor(status: string): string {
  switch (status) {
    case 'CHECKED_OUT':
      return 'bg-green-100 text-green-700';
    case 'ACTIVE':
      return 'bg-yellow-100 text-yellow-700';
    case 'REMOVED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function GroupOrderDetailPage(): ReactElement {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<GroupOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupOrder = async () => {
      try {
        const response = await fetch(`/api/v1/admin/group-orders/${id}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch group order');
        }
      } catch {
        setError('Failed to fetch group order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGroupOrder();
    }
  }, [id]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
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

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Group order not found'}</p>
          <Link href="/ops/orders" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/ops/orders" className="text-blue-600 hover:underline">Orders</Link>
        <span className="text-gray-400">/</span>
        <Link href="/ops/group-orders" className="text-blue-600 hover:underline">Group Orders</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{data.shareCode}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(data.status)}`}>
              {data.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Share Code: <span className="font-mono font-bold text-purple-600">{data.shareCode}</span>
          </p>
        </div>
        <Link
          href="/ops/orders"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
        >
          Back to Orders
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.participantCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.orderCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Checked Out</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {data.summary.checkedOutCount} / {data.summary.participantCount}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(data.summary.totalOrderValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Host Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Host
            </h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{data.host.name || 'Unknown'}</p>
              {data.host.email && (
                <p className="text-sm text-gray-500">{data.host.email}</p>
              )}
              {data.host.phone && (
                <p className="text-sm text-gray-500">{data.host.phone}</p>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Delivery
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Date & Time</p>
                <p className="font-medium text-gray-900">{formatDate(data.deliveryDate)}</p>
                <p className="text-sm text-gray-600">{data.deliveryTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Address</p>
                <p className="font-medium text-gray-900">{data.deliveryAddress.address1}</p>
                <p className="text-sm text-gray-600">
                  {data.deliveryAddress.city}, {data.deliveryAddress.state} {data.deliveryAddress.zip}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Minimum Order</p>
                <p className="font-medium text-gray-900">{formatCurrency(data.minimumOrderAmount)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm font-medium text-gray-900">{formatDateTime(data.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Expires</span>
                <span className="text-sm font-medium text-gray-900">{formatDateTime(data.expiresAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Participants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Participants ({data.participants.length})
            </h2>
            <div className="space-y-3">
              {data.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                      {(participant.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.name || participant.guestName || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{participant.email || participant.guestEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(participant.cartTotal)}</p>
                      <p className="text-xs text-gray-500">{participant.itemCount} items</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getParticipantStatusColor(participant.status)}`}>
                      {participant.status === 'CHECKED_OUT' ? 'Checked Out' : participant.status}
                    </span>
                    {participant.shopifyOrderId && (
                      <Link
                        href={`/ops/orders/${participant.shopifyOrderId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {participant.shopifyOrderName || 'View Order'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Sub-Orders ({data.orders.length})
            </h2>
            {data.orders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders created yet</p>
            ) : (
              <div className="space-y-4">
                {data.orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/ops/orders/${order.id}`}
                          className="font-mono font-bold text-blue-600 hover:text-blue-700 text-lg"
                        >
                          #{order.orderNumber}
                        </Link>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{order.customerName}</span>
                      <span>{order.itemCount} items</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.title}
                              {item.variantTitle && ` (${item.variantTitle})`}
                            </span>
                            <span className="text-gray-900">{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-500">+ {order.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
