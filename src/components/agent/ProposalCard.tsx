'use client';

import { useState } from 'react';

interface ProposalItem {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
}

interface DraftOrderProposal {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryNotes?: string;
  deliveryZone: string;
  items: ProposalItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  originalDeliveryFee?: number;
  discountAmount: number;
  total: number;
  freeDeliveryApplied?: boolean;
  discountCode?: string;
  adminNotes?: string;
}

interface InventoryAdjustment {
  productTitle: string;
  variantTitle?: string;
  quantityChange: number;
  reason: string;
}

interface InventoryProposal {
  adjustments: InventoryAdjustment[];
}

interface ProposalCardProps {
  id: string;
  type: 'DRAFT_ORDER' | 'INVENTORY_ADJUSTMENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  data: DraftOrderProposal | InventoryProposal;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function ProposalCard({ id, type, status, data, onApprove, onReject }: ProposalCardProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    try {
      await onApprove(id);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    try {
      await onReject(id);
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = status !== 'PENDING' ? (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      status === 'APPROVED'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}>
      {status}
    </span>
  ) : null;

  if (type === 'DRAFT_ORDER') {
    const d = data as DraftOrderProposal;
    return (
      <div className="mx-4 my-2 border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="bg-blue-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <span className="text-sm font-semibold text-blue-800">Draft Order Proposal</span>
          {statusBadge}
        </div>
        <div className="p-4 space-y-3">
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>{' '}
              <span className="font-medium">{d.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium">{d.customerEmail}</span>
            </div>
            {d.customerPhone && (
              <div>
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium">{d.customerPhone}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Zone:</span>{' '}
              <span className="font-medium">{d.deliveryZone}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="text-sm">
            <span className="text-gray-500">Delivery:</span>{' '}
            <span className="font-medium">
              {d.deliveryAddress}, {d.deliveryCity}, {d.deliveryState} {d.deliveryZip}
            </span>
            <br />
            <span className="text-gray-500">Date:</span>{' '}
            <span className="font-medium">
              {new Date(d.deliveryDate).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })} at {d.deliveryTime}
            </span>
            {d.deliveryNotes && (
              <>
                <br />
                <span className="text-gray-500">Notes:</span>{' '}
                <span className="font-medium">{d.deliveryNotes}</span>
              </>
            )}
          </div>

          {/* Line items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-left">
                <th className="py-1 font-medium">Item</th>
                <th className="py-1 font-medium text-center">Qty</th>
                <th className="py-1 font-medium text-right">Price</th>
                <th className="py-1 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {d.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5">
                    {item.title}
                    {item.variantTitle && (
                      <span className="text-gray-400 text-xs ml-1">({item.variantTitle})</span>
                    )}
                  </td>
                  <td className="py-1.5 text-center">{item.quantity}</td>
                  <td className="py-1.5 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-1.5 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="text-sm space-y-0.5 border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${d.subtotal.toFixed(2)}</span>
            </div>
            {d.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{d.discountCode ? ` (${d.discountCode})` : ''}</span>
                <span>-${d.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (8.25%)</span>
              <span>${d.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span>
                {d.freeDeliveryApplied ? (
                  <>
                    <span className="line-through text-gray-400 mr-1">${d.originalDeliveryFee?.toFixed(2)}</span>
                    <span className="text-green-600">FREE</span>
                  </>
                ) : (
                  `$${d.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
              <span>Total</span>
              <span>${d.total.toFixed(2)}</span>
            </div>
          </div>

          {d.adminNotes && (
            <div className="text-sm text-gray-500 italic">
              Notes: {d.adminNotes}
            </div>
          )}
        </div>

        {/* Actions */}
        {status === 'PENDING' && (
          <div className="border-t border-gray-200 px-4 py-3 flex gap-2 justify-end bg-gray-50">
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              {loading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading === 'approve' ? 'Approving...' : 'Approve & Create'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Inventory adjustment
  const inv = data as InventoryProposal;
  return (
    <div className="mx-4 my-2 border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="bg-amber-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-sm font-semibold text-amber-800">Inventory Adjustment Proposal</span>
        {statusBadge}
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-left">
              <th className="py-1 font-medium">Product</th>
              <th className="py-1 font-medium text-center">Change</th>
              <th className="py-1 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {inv.adjustments.map((adj, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1.5">
                  {adj.productTitle}
                  {adj.variantTitle && (
                    <span className="text-gray-400 text-xs ml-1">({adj.variantTitle})</span>
                  )}
                </td>
                <td className={`py-1.5 text-center font-medium ${
                  adj.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                </td>
                <td className="py-1.5 text-gray-600">{adj.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status === 'PENDING' && (
        <div className="border-t border-gray-200 px-4 py-3 flex gap-2 justify-end bg-gray-50">
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            {loading === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading === 'approve' ? 'Approving...' : 'Approve & Execute'}
          </button>
        </div>
      )}
    </div>
  );
}
