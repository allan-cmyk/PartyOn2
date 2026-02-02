'use client';

import { useState, ReactElement } from 'react';
import { checkoutParticipantV2 } from '@/lib/group-orders-v2/api-client';
import type { DraftCartItemView, SubOrderFull } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  tab: SubOrderFull;
  participantId: string;
  items: DraftCartItemView[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutSummaryModal({
  shareCode,
  tab,
  participantId,
  items,
  isOpen,
  onClose,
}: Props): ReactElement | null {
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const myItems = (items || []).filter((i) => i.addedBy?.id === participantId);
  const subtotal = myItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
  const addr = tab.deliveryAddress;

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await checkoutParticipantV2(
        shareCode,
        tab.id,
        participantId,
        discountCode || undefined
      );
      if (!result.checkoutUrl) {
        throw new Error('No checkout URL returned');
      }
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl border border-v2-border max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-sans font-semibold text-v2-text">Order Summary</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Delivery info */}
        <div className="bg-v2-bgSoft rounded-lg p-3 mb-4 text-sm text-v2-muted">
          <p className="font-medium text-v2-text">{tab.name}</p>
          <p>
            {new Date(tab.deliveryDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}{' '}
            at {tab.deliveryTime}
          </p>
          <p>
            {addr?.address1 ?? ''}{addr?.city ? `, ${addr.city}` : ''}{addr?.province ? `, ${addr.province}` : ''} {addr?.zip ?? ''}
          </p>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-900">
            Your Items ({myItems.length})
          </p>
          <div className="divide-y divide-gray-100">
            {myItems.map((item) => (
              <div key={item.id} className="flex justify-between py-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">{item.title}</p>
                  {item.variantTitle && (
                    <p className="text-gray-400 text-xs">{item.variantTitle}</p>
                  )}
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-gray-900">
                    ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-gray-400 text-xs">
                      {item.quantity} x ${Number(item.price).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Code (optional)
          </label>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="w-full border border-v2-border rounded-lg px-3 py-2 text-sm text-v2-text focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* Totals */}
        <div className="border-t border-v2-border pt-3 mb-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Tax</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-1">
            <span>Estimated Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400">
            Final total including tax will be shown on the Stripe checkout page.
          </p>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || myItems.length === 0}
          className="w-full py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Redirecting to checkout...' : `Pay $${subtotal.toFixed(2)}`}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
