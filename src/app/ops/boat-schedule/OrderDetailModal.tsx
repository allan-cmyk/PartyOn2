'use client';

import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  totalPrice: number;
  fulfilledQuantity: number;
  refundedQuantity: number;
}

interface GroupTab {
  id: string;
  name: string;
  status: string;
  deliveryDate: string;
  deliveryTime: string;
  itemCount: number;
  items: {
    title: string;
    variantTitle: string | null;
    quantity: number;
    price: number;
  }[];
}

interface OrderDetail {
  id: string;
  orderNumber: number;
  status: string;
  fulfillmentStatus: string;
  financialStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryPhone: string | null;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: Record<string, string> | null;
  deliveryInstructions: string | null;
  customerNote: string | null;
  internalNote: string | null;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  tipAmount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  groupOrderV2: {
    id: string;
    shareCode: string;
    name: string;
    status: string;
    tabs: GroupTab[];
  } | null;
}

export default function OrderDetailModal({
  orderNumber,
  onClose,
}: {
  orderNumber: number;
  onClose: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/ops/boat-schedule/order/${orderNumber}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        setOrder(json);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [orderNumber]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Order #{order?.orderNumber ?? orderNumber}
            </h2>
            {order && (
              <p className="text-xs text-blue-200 mt-0.5 font-mono uppercase tracking-widest">
                {order.fulfillmentStatus.replace(/_/g, ' ')} &middot;{' '}
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                {' '}&middot; ${order.total.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-12 text-center text-gray-500">Loading order...</div>
          )}
          {error && (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
                {error}
              </div>
            </div>
          )}
          {order && <OrderBody order={order} />}
        </div>
      </div>
    </div>
  );
}

function OrderBody({ order }: { order: OrderDetail }) {
  const addr = order.deliveryAddress || {};
  return (
    <div className="p-6 space-y-6">
      {/* Top row: customer + delivery */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Customer</SectionTitle>
          <div className="text-base font-semibold text-gray-900">{order.customerName}</div>
          <div className="text-sm text-gray-700">
            <a href={`mailto:${order.customerEmail}`} className="hover:text-blue-700">
              {order.customerEmail}
            </a>
          </div>
          {(order.customerPhone || order.deliveryPhone) && (
            <div className="text-sm font-mono text-gray-600">
              <a
                href={`tel:${order.customerPhone || order.deliveryPhone}`}
                className="hover:text-blue-700"
              >
                {formatPhone(order.customerPhone || order.deliveryPhone || '')}
              </a>
            </div>
          )}
        </div>
        <div>
          <SectionTitle>Delivery</SectionTitle>
          <div className="text-sm text-gray-900 font-medium">
            {formatDeliveryDate(order.deliveryDate)} &middot; {order.deliveryTime}
          </div>
          <div className="text-sm text-gray-700 leading-snug mt-1">
            {addr.address1 && <div>{addr.address1}</div>}
            {addr.address2 && <div>{addr.address2}</div>}
            {(addr.city || addr.province || addr.zip) && (
              <div>
                {addr.city}
                {addr.city && (addr.province || addr.zip) ? ', ' : ''}
                {addr.province} {addr.zip}
              </div>
            )}
          </div>
          {order.deliveryInstructions && (
            <div className="text-xs text-gray-600 mt-2 italic">
              {order.deliveryInstructions}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {(order.customerNote || order.internalNote) && (
        <div className="grid md:grid-cols-2 gap-6">
          {order.customerNote && (
            <div>
              <SectionTitle>Customer Note</SectionTitle>
              <div className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-md p-3 leading-snug">
                {order.customerNote}
              </div>
            </div>
          )}
          {order.internalNote && (
            <div>
              <SectionTitle>Internal Note</SectionTitle>
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 leading-snug">
                {order.internalNote}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div>
        <SectionTitle>
          Items ({order.items.length})
        </SectionTitle>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Item</th>
                <th className="px-3 py-2 text-right font-semibold w-16">Qty</th>
                <th className="px-3 py-2 text-right font-semibold w-20">Price</th>
                <th className="px-3 py-2 text-right font-semibold w-20">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    {item.variantTitle && (
                      <div className="text-xs text-gray-500">{item.variantTitle}</div>
                    )}
                    {item.sku && (
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                        SKU {item.sku}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-mono text-gray-600">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-medium">
                    ${item.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-1 text-sm">
          <TotalRow label="Subtotal" value={order.subtotal} />
          {order.discountAmount > 0 && (
            <TotalRow
              label={`Discount${order.discountCode ? ` (${order.discountCode})` : ''}`}
              value={-order.discountAmount}
              className="text-green-700"
            />
          )}
          <TotalRow label="Tax" value={order.taxAmount} />
          <TotalRow label="Delivery" value={order.deliveryFee} />
          {order.tipAmount > 0 && <TotalRow label="Tip" value={order.tipAmount} />}
          <div className="border-t border-gray-200 pt-1 mt-1">
            <TotalRow
              label="Total"
              value={order.total}
              className="font-bold text-base text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Group order tabs */}
      {order.groupOrderV2 && order.groupOrderV2.tabs.length > 0 && (
        <div>
          <SectionTitle>
            Group Order Sub-Orders ({order.groupOrderV2.tabs.length})
          </SectionTitle>
          <p className="text-xs text-gray-500 mb-3">
            Group: <span className="font-mono">{order.groupOrderV2.shareCode}</span>
            {order.groupOrderV2.name && ` · ${order.groupOrderV2.name}`}
          </p>
          <div className="space-y-3">
            {order.groupOrderV2.tabs.map(tab => (
              <div key={tab.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{tab.name}</div>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500">
                    {tab.status} &middot; {tab.itemCount}{' '}
                    {tab.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {tab.items.length > 0 && (
                  <ul className="text-sm text-gray-700 space-y-0.5">
                    {tab.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between gap-3">
                        <span>
                          <span className="font-mono text-gray-500 mr-2">
                            {i.quantity}&times;
                          </span>
                          {i.title}
                          {i.variantTitle && (
                            <span className="text-gray-500 ml-1">({i.variantTitle})</span>
                          )}
                        </span>
                        <span className="font-mono text-gray-600">${i.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer link to full admin page */}
      <div className="pt-4 border-t border-gray-200 text-right">
        <a
          href={`/ops/orders?search=${order.orderNumber}`}
          className="text-sm text-blue-700 hover:underline"
        >
          Open in full Orders view →
        </a>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1.5">
      {children}
    </div>
  );
}

function TotalRow({
  label,
  value,
  className = '',
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className="text-gray-600">{label}</span>
      <span className="font-mono">${value.toFixed(2)}</span>
    </div>
  );
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatDeliveryDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
