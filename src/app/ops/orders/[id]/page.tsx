'use client';

import { useState, useEffect, ReactElement, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    FULFILLED: 'bg-green-100 text-green-800',
    UNFULFILLED: 'bg-orange-100 text-orange-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
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

export default function OrderDetailPage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

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
        // Refresh order data
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Order</h2>
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link
            href="/ops/orders"
            className="text-blue-600 hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen View */}
      <div className="max-w-7xl mx-auto px-4 py-6 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/ops/orders"
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                Order {order.orderNumber}
              </h1>
              {order.groupOrder.isGroupOrder && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  Group Order
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Created {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Print Order Sheet
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Order Status
            </label>
            <select
              value={order.status}
              onChange={(e) => updateOrder({ status: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 rounded-md border ${getStatusColor(order.status)} font-medium`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Financial Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Payment Status
            </label>
            <span className={`inline-block px-3 py-2 rounded-md text-sm font-medium ${getStatusColor(order.financialStatus)}`}>
              {order.financialStatus}
            </span>
          </div>

          {/* Fulfillment Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Fulfillment
            </label>
            <select
              value={order.fulfillmentStatus}
              onChange={(e) => updateOrder({ fulfillmentStatus: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 rounded-md border ${getStatusColor(order.fulfillmentStatus)} font-medium`}
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      {item.variantTitle && item.variantTitle !== 'Default Title' && (
                        <p className="text-sm text-gray-500">{item.variantTitle}</p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
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
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${order.pricing.subtotal.toFixed(2)}</span>
                </div>
                {order.pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount {order.pricing.discountCode && `(${order.pricing.discountCode})`}
                    </span>
                    <span className="text-green-600">-${order.pricing.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-800">${order.pricing.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-800">${order.pricing.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>${order.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Delivery Details</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Delivery Date</p>
                    <p className="font-medium">{formatDate(order.delivery.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Window</p>
                    <p className="font-medium">{order.delivery.time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium">
                    {order.delivery.address.address1}
                    {order.delivery.address.address2 && `, ${order.delivery.address.address2}`}
                  </p>
                  <p className="text-gray-600">
                    {order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zip}
                  </p>
                </div>
                {order.delivery.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery Phone</p>
                    <p className="font-medium">{order.delivery.phone}</p>
                  </div>
                )}
                {order.delivery.instructions && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery Instructions</p>
                    <p className="text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                      {order.delivery.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
              </div>
              <div className="p-4 space-y-4">
                {order.notes.customer && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer Note</p>
                    <p className="text-gray-800 bg-blue-50 p-2 rounded border border-blue-200">
                      {order.notes.customer}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Internal Note</p>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    onBlur={() => {
                      if (internalNote !== order.notes.internal) {
                        updateOrder({ internalNote });
                      }
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add internal notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Payment */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Customer</h2>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-800">
                    {order.customer.name || order.customerSnapshot.name || 'Guest'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.customer.email}
                  </a>
                </div>
                {(order.customer.phone || order.customerSnapshot.phone) && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a
                      href={`tel:${order.customer.phone || order.customerSnapshot.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.customer.phone || order.customerSnapshot.phone}
                    </a>
                  </div>
                )}
                <div className="pt-2">
                  <Link
                    href={`/ops/customers?search=${encodeURIComponent(order.customer.email)}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Customer Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Payment</h2>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(order.financialStatus)}`}>
                    {order.financialStatus}
                  </span>
                </div>
                {order.payment.stripePaymentIntentId && (
                  <div>
                    <p className="text-sm text-gray-500">Stripe Payment ID</p>
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {order.payment.stripePaymentIntentId}
                    </p>
                  </div>
                )}
                {order.shopify.orderId && (
                  <div>
                    <p className="text-sm text-gray-500">Shopify Order</p>
                    <p className="text-sm text-gray-600">
                      #{order.shopify.orderNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-800">{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-800">{formatDateTime(order.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print View - Order Sheet */}
      <div ref={printRef} className="hidden print:block p-8">
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <div className="bg-blue-900 text-white py-2 px-4 text-xl font-bold mb-2">
            ORDER #{order.orderNumber}
          </div>
          <h1 className="text-2xl font-bold">Party On Delivery</h1>
          <p className="text-gray-600">Order Sheet</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Delivery Info */}
          <div>
            <h2 className="font-bold text-lg border-b border-gray-300 mb-2">DELIVERY</h2>
            <p className="font-bold text-lg">{formatDate(order.delivery.date)}</p>
            <p className="text-lg">{order.delivery.time}</p>
            <div className="mt-2">
              <p className="font-medium">{order.delivery.address.address1}</p>
              {order.delivery.address.address2 && (
                <p>{order.delivery.address.address2}</p>
              )}
              <p>{order.delivery.address.city}, {order.delivery.address.state} {order.delivery.address.zip}</p>
            </div>
            {order.delivery.phone && (
              <p className="mt-2">Phone: {order.delivery.phone}</p>
            )}
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="font-bold text-lg border-b border-gray-300 mb-2">CUSTOMER</h2>
            <p className="font-medium">{order.customer.name || order.customerSnapshot.name}</p>
            <p>{order.customer.email}</p>
            {(order.customer.phone || order.customerSnapshot.phone) && (
              <p>{order.customer.phone || order.customerSnapshot.phone}</p>
            )}
          </div>
        </div>

        {order.delivery.instructions && (
          <div className="mb-6 p-3 border-2 border-yellow-500 bg-yellow-50">
            <h2 className="font-bold">DELIVERY INSTRUCTIONS:</h2>
            <p>{order.delivery.instructions}</p>
          </div>
        )}

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2 w-20">Qty</th>
              <th className="text-right py-2 w-24">Price</th>
              <th className="text-center py-2 w-16">✓</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2">
                  <p className="font-medium">{item.title}</p>
                  {item.variantTitle && item.variantTitle !== 'Default Title' && (
                    <p className="text-sm text-gray-600">{item.variantTitle}</p>
                  )}
                </td>
                <td className="text-center py-2 font-bold text-lg">{item.quantity}</td>
                <td className="text-right py-2">${item.total.toFixed(2)}</td>
                <td className="text-center py-2">
                  <span className="inline-block w-6 h-6 border-2 border-black"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>${order.pricing.subtotal.toFixed(2)}</span>
            </div>
            {order.pricing.discountAmount > 0 && (
              <div className="flex justify-between py-1">
                <span>Discount:</span>
                <span>-${order.pricing.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span>Delivery:</span>
              <span>${order.pricing.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax:</span>
              <span>${order.pricing.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-black font-bold text-lg">
              <span>TOTAL:</span>
              <span>${order.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {order.notes.customer && (
          <div className="mt-6 p-3 border border-gray-300">
            <h2 className="font-bold">Customer Note:</h2>
            <p>{order.notes.customer}</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Printed on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </>
  );
}
