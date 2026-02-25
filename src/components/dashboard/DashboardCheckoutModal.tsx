'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import type { DraftCartItemView, SubOrderFull } from '@/lib/group-orders-v2/types';
import {
  checkoutParticipantV2,
  checkoutAllV2,
  validateGroupDiscount,
} from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  tab: SubOrderFull;
  participantId: string;
  mode: 'mine' | 'all';
  items: DraftCartItemView[];
  onClose: () => void;
  onOpenDeliveryDetails: () => void;
}

export default function DashboardCheckoutModal({
  shareCode,
  tab,
  participantId,
  mode,
  items,
  onClose,
  onOpenDeliveryDetails,
}: Props): ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<{
    code: string;
    amount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState('');

  const hasAddress = !!tab.deliveryAddress?.address1?.trim();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = discountApplied?.amount || 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  async function handleApplyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountError('');
    try {
      const result = await validateGroupDiscount(discountCode.trim(), subtotal);
      setDiscountApplied({
        code: result.code,
        amount: result.discountAmount,
      });
    } catch (err) {
      setDiscountError(
        err instanceof Error ? err.message : 'Invalid discount code'
      );
    }
  }

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!hasAddress) {
      setError('Delivery address is required');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'mine') {
        const result = await checkoutParticipantV2(
          shareCode,
          tab.id,
          participantId,
          discountApplied?.code
        );
        window.location.href = result.checkoutUrl;
      } else {
        const result = await checkoutAllV2(
          shareCode,
          tab.id,
          participantId,
          discountApplied?.code
        );
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  }

  const deliveryDate = tab.deliveryDate && tab.deliveryDate !== 'TBD'
    ? new Date(tab.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';
  const deliveryTime = tab.deliveryTime && tab.deliveryTime !== 'TBD' ? tab.deliveryTime : '';
  const addr = tab.deliveryAddress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900">
            {mode === 'mine'
              ? 'Checkout'
              : tab.purchasedItems.length > 0
                ? 'Pay for Remaining'
                : 'Pay for Everything'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCheckout} className="px-6 py-4 space-y-4">
          {/* Items summary */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.quantity}x {item.title}
                  </span>
                  <span className="text-gray-900 font-medium flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Discount code */}
          <div>
            {discountApplied ? (
              <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-green-700 font-medium">
                  {discountApplied.code} (-${discountApplied.amount.toFixed(2)})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountApplied(null);
                    setDiscountCode('');
                    setDiscountError('');
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Discount code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            {discountError && (
              <p className="text-xs text-red-600 mt-1">{discountError}</p>
            )}
          </div>

          {/* Delivery details section */}
          {hasAddress ? (
            <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Delivery</p>
              {(deliveryDate || deliveryTime) && (
                <p className="text-sm text-gray-700">
                  {deliveryDate}{deliveryTime ? ` at ${deliveryTime}` : ''}
                </p>
              )}
              {addr?.address1 && (
                <p className="text-sm text-gray-700">
                  {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}{addr.city ? `, ${addr.city}` : ''}{addr.province ? `, ${addr.province}` : ''} {addr.zip || ''}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800 mb-2">
                Please fill out delivery details before checking out.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeliveryDetails();
                }}
                className="text-sm font-semibold text-brand-blue hover:text-blue-700 transition-colors"
              >
                Fill out delivery details
              </button>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600">Discount</span>
                <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-500">Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-2">
              <span>Estimated Total</span>
              <span>${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || items.length === 0 || !hasAddress}
            className="w-full py-3 bg-brand-blue text-white font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Continue to Payment - $${estimatedTotal.toFixed(2)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
