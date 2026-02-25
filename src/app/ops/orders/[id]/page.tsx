'use client';

import { useState, useEffect, ReactElement, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OrderItem {
  id: string;
  product: { id: string; title: string; handle: string };
  variant: { id: string; title: string; sku: string } | null;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  price: number;
  total: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customer: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
  };
  customerSnapshot: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discountCode: string | null;
    discountAmount: number;
    taxAmount: number;
    deliveryFee: number;
    total: number;
  };
  delivery: {
    date: string;
    time: string;
    type: string;
    address: {
      address1: string;
      address2: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    phone: string | null;
    instructions: string | null;
  };
  payment: {
    stripePaymentIntentId: string | null;
    stripeCheckoutSessionId: string | null;
    stripeChargeId: string | null;
  };
  shopify: {
    orderId: string | null;
    orderNumber: string | null;
  };
  groupOrder: {
    id: string | null;
    isGroupOrder: boolean;
    name: string | null;
    shareCode: string | null;
    status: string | null;
    siblingOrders: {
      id: string;
      orderNumber: string;
      customerName: string;
      total: number;
      status: string;
    }[];
  };
  notes: {
    customer: string | null;
    internal: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const FULFILLMENT_OPTIONS = ['UNFULFILLED', 'PARTIAL', 'FULFILLED'];

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    PAID: 'bg-green-100 text-green-700 border-green-200',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
    FULFILLED: 'bg-green-100 text-green-700 border-green-200',
    UNFULFILLED: 'bg-orange-100 text-orange-700 border-orange-200',
    PARTIAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Section header component
function SectionHeader({ icon, title }: { icon: ReactElement; title: string }): ReactElement {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
      <span className="text-gray-400">{icon}</span>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

export default function OrderDetailPage(): ReactElement {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load order');
        return;
      }

      setOrder(data.data);
      setInternalNote(data.data.notes.internal || '');
    } catch {
      setError('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function updateOrder(updates: Record<string, unknown>): Promise<void> {
    if (!order) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        await fetchOrder();
      } else {
        alert('Failed to update order: ' + data.error);
      }
    } catch {
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  function handlePrint(): void {
    window.print();
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-gray-200 rounded-lg" />
              <div className="h-10 w-48 bg-gray-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded-xl" />
              <div className="h-24 bg-gray-200 rounded-xl" />
              <div className="h-24 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Order</h2>
            <p className="text-red-600 mb-6">{error || 'Order not found'}</p>
            <Link
              href="/ops/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen View */}
      <div className="p-8 bg-gray-50 min-h-screen print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/ops/orders"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  {order.groupOrder.isGroupOrder && (
                    <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200 rounded-full">
                      Group Order
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1">
                  Created {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Order Sheet
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Order Status
              </label>
              <select
                value={order.status}
                onChange={(e) => updateOrder({ status: e.target.value })}
                disabled={saving}
                className={`w-full px-4 py-2.5 rounded-lg border-2 ${getStatusColor(order.status)} font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Financial Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Payment Status
              </label>
              <div className={`px-4 py-2.5 rounded-lg border-2 ${getStatusColor(order.financialStatus)} font-semibold text-center`}>
                {order.financialStatus}
              </div>
            </div>

            {/* Fulfillment Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Fulfillment
              </label>
              <select
                value={order.fulfillmentStatus}
                onChange={(e) => updateOrder({ fulfillmentStatus: e.target.value })}
                disabled={saving}
                className={`w-full px-4 py-2.5 rounded-lg border-2 ${getStatusColor(order.fulfillmentStatus)} font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
              >
                {FULFILLMENT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                  title="Order Items"
                />
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        {item.variantTitle && item.variantTitle !== 'Default Title' && (
                          <p className="text-sm text-gray-500">{item.variantTitle}</p>
                        )}
                        {item.sku && (
                          <p className="text-xs text-gray-400 font-mono">SKU: {item.sku}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pricing Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {order.pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount {order.pricing.discountCode && (
                          <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded ml-2">
                            {order.pricing.discountCode}
                          </span>
                        )}
                      </span>
                      <span className="text-green-600 font-medium">-${order.pricing.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900 font-medium">${order.pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8.25%)</span>
                    <span className="text-gray-900 font-medium">${order.pricing.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 mt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">${order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Delivery Details"
                />
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Delivery Date</p>
                      <p className="font-bold text-gray-900 text-lg">{formatDate(order.delivery.date)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Time Window</p>
                      <p className="font-bold text-gray-900 text-lg">{order.delivery.time}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                      <p className="font-medium text-gray-900">
                        {order.delivery.address.address1}
                        {order.delivery.address.address2 && `, ${order.delivery.address.address2}`}
                      </p>
                      <p className="text-gray-600">
                        {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zip}
                      </p>
                    </div>
                    {order.delivery.phone && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Phone</p>
                        <a href={`tel:${order.delivery.phone}`} className="text-blue-600 hover:underline font-medium">
                          {order.delivery.phone}
                        </a>
                      </div>
                    )}
                    {order.delivery.instructions && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Instructions</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-800">
                          <svg className="w-5 h-5 text-yellow-500 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {order.delivery.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                  title="Notes"
                />
                <div className="p-6 space-y-4">
                  {order.notes.customer && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer Note</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
                        {order.notes.customer}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Internal Note</p>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      onBlur={() => {
                        if (internalNote !== order.notes.internal) {
                          updateOrder({ internalNote });
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add internal notes about this order..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Payment */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  title="Customer"
                />
                <div className="p-6 space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {order.customer.name || order.customerSnapshot.name || 'Guest'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                  {(order.customer.phone || order.customerSnapshot.phone) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <a
                        href={`tel:${order.customer.phone || order.customerSnapshot.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.customer.phone || order.customerSnapshot.phone}
                      </a>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/ops/customers?search=${encodeURIComponent(order.customer.email)}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Customer Profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Group Order Info - Only show if part of a group */}
              {order.groupOrder.isGroupOrder && order.groupOrder.id && (
                <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-purple-100 bg-purple-50">
                    <span className="text-purple-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <h2 className="text-lg font-semibold text-purple-900">Part of Group Order</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Parent Group</p>
                      <Link
                        href={`/ops/group-orders/${order.groupOrder.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        <span className="font-mono">{order.groupOrder.shareCode}</span>
                        {order.groupOrder.name && (
                          <span className="text-purple-600">- {order.groupOrder.name}</span>
                        )}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {order.groupOrder.status && (
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.groupOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.groupOrder.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.groupOrder.status}
                        </span>
                      )}
                    </div>

                    {order.groupOrder.siblingOrders.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Other Orders in This Group ({order.groupOrder.siblingOrders.length})
                        </p>
                        <div className="space-y-2">
                          {order.groupOrder.siblingOrders.map((sibling) => (
                            <Link
                              key={sibling.id}
                              href={`/ops/orders/${sibling.id}`}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div>
                                <span className="font-mono text-sm text-gray-900">#{sibling.orderNumber}</span>
                                <span className="text-gray-500 ml-2">- {sibling.customerName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-900">${sibling.total.toFixed(2)}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(sibling.status)}`}>
                                  {sibling.status}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                  title="Payment"
                />
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</p>
                    <span className={`inline-flex px-3 py-1.5 rounded-lg border text-sm font-semibold ${getStatusColor(order.financialStatus)}`}>
                      {order.financialStatus}
                    </span>
                  </div>
                  {order.payment.stripePaymentIntentId && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Stripe Payment ID</p>
                      <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                        {order.payment.stripePaymentIntentId}
                      </p>
                    </div>
                  )}
                  {order.shopify.orderId && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shopify Order</p>
                      <p className="text-sm text-gray-600">
                        #{order.shopify.orderNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Timeline"
                />
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm text-gray-900 font-medium">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900 font-medium">{formatDateTime(order.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print View - Compact Order Sheet (fits one letter page) */}
      <div ref={printRef} className="hidden print:block order-sheet">
        {/* Header row: order number + business name on one line */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
          <div className="flex items-center gap-3">
            <span className="bg-black text-white text-lg font-bold px-3 py-1 rounded">
              #{order.orderNumber}
            </span>
            <span className="text-lg font-bold">Party On Delivery</span>
          </div>
          <span className="text-xs text-gray-500">
            Printed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Delivery + Customer side by side, compact */}
        <div className="flex gap-4 mb-3">
          <div className="flex-1 border border-gray-400 rounded p-2">
            <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">Delivery</div>
            <div className="font-bold text-sm">
              {new Date(order.delivery.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
              {' '}&middot;{' '}{order.delivery.time}
            </div>
            <div className="text-sm mt-1">
              {order.delivery.address.address1}
              {order.delivery.address.address2 ? `, ${order.delivery.address.address2}` : ''}
              <br />
              {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zip}
            </div>
            {order.delivery.phone && (
              <div className="text-sm mt-1">Tel: {order.delivery.phone}</div>
            )}
          </div>
          <div className="w-52 border border-gray-400 rounded p-2">
            <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">Customer</div>
            <div className="font-bold text-sm">{order.customer.name || order.customerSnapshot.name || 'Guest'}</div>
            <div className="text-sm">{order.customer.email}</div>
            {(order.customer.phone || order.customerSnapshot.phone) && (
              <div className="text-sm">Tel: {order.customer.phone || order.customerSnapshot.phone}</div>
            )}
          </div>
        </div>

        {/* Delivery instructions - compact */}
        {order.delivery.instructions && (
          <div className="mb-3 px-2 py-1.5 border-2 border-yellow-500 bg-yellow-50 rounded text-sm">
            <span className="font-bold">Instructions: </span>{order.delivery.instructions}
          </div>
        )}

        {/* Items Table - tight rows */}
        <table className="w-full mb-3 border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-1 px-2 font-bold">Item</th>
              <th className="text-center py-1 px-2 w-12 font-bold">Qty</th>
              <th className="text-right py-1 px-2 w-20 font-bold">Price</th>
              <th className="text-center py-1 w-10 font-bold">OK</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-1 px-2">
                  <span className="font-medium">{item.title}</span>
                  {item.variantTitle && item.variantTitle !== 'Default Title' && (
                    <span className="text-gray-500 ml-1">({item.variantTitle})</span>
                  )}
                </td>
                <td className="text-center py-1 px-2 font-bold text-base">{item.quantity}</td>
                <td className="text-right py-1 px-2">${item.total.toFixed(2)}</td>
                <td className="text-center py-1">
                  <span className="inline-block w-4 h-4 border-2 border-black rounded-sm"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom row: notes on left, totals on right */}
        <div className="flex gap-4">
          <div className="flex-1">
            {order.notes.customer && (
              <div className="border border-gray-400 rounded p-2 text-sm">
                <span className="font-bold">Customer Note: </span>{order.notes.customer}
              </div>
            )}
            {order.pricing.discountCode && (
              <div className="mt-1 text-sm">
                <span className="font-bold">Discount: </span>
                <span className="font-mono">{order.pricing.discountCode}</span>
                {order.pricing.discountAmount > 0 && (
                  <span> (-${order.pricing.discountAmount.toFixed(2)})</span>
                )}
              </div>
            )}
          </div>
          <div className="w-48 border border-gray-400 rounded overflow-hidden text-sm">
            <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
              <span>Subtotal</span>
              <span>${order.pricing.subtotal.toFixed(2)}</span>
            </div>
            {order.pricing.discountAmount > 0 && (
              <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
                <span>Discount</span>
                <span>-${order.pricing.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
              <span>Delivery</span>
              <span>${order.pricing.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
              <span>Tax</span>
              <span>${order.pricing.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 px-2 bg-gray-100 font-bold text-base">
              <span>TOTAL</span>
              <span>${order.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
