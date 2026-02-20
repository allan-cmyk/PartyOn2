'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import type { DraftCartItemView, SubOrderFull } from '@/lib/group-orders-v2/types';
import {
  checkoutParticipantV2,
  validateGroupDiscount,
  updateTabV2,
} from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  tab: SubOrderFull;
  participantId: string;
  mode: 'mine' | 'all';
  items: DraftCartItemView[];
  onClose: () => void;
  onRefresh: () => void;
}

const CONTEXT_PLACEHOLDERS: Record<string, string> = {
  HOUSE: 'Gate code, ring doorbell, etc.',
  BOAT: 'Slip number, marina name, dock instructions...',
  VENUE: 'Suite number, loading dock instructions...',
  HOTEL: 'Room number, front desk instructions...',
  OTHER: 'Any special delivery instructions...',
};

export default function DashboardCheckoutModal({
  shareCode,
  tab,
  participantId,
  mode,
  items,
  onClose,
  onRefresh,
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

  // Delivery form (if not yet filled)
  const hasAddress = tab.deliveryAddress?.address1?.trim();
  const [address1, setAddress1] = useState(tab.deliveryAddress?.address1 || '');
  const [address2, setAddress2] = useState(tab.deliveryAddress?.address2 || '');
  const [city, setCity] = useState(tab.deliveryAddress?.city || '');
  const [zip, setZip] = useState(tab.deliveryAddress?.zip || '');
  const [phone, setPhone] = useState(tab.deliveryPhone || '');
  const [deliveryDate, setDeliveryDate] = useState(
    tab.deliveryDate ? tab.deliveryDate.split('T')[0] : ''
  );
  const [deliveryTime, setDeliveryTime] = useState(tab.deliveryTime || '');
  const [deliveryNotes, setDeliveryNotes] = useState(tab.deliveryNotes || '');

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
    setLoading(true);

    try {
      // Save delivery details if not already filled
      if (!hasAddress && address1.trim()) {
        await updateTabV2(shareCode, tab.id, {
          hostParticipantId: participantId,
          deliveryAddress: {
            address1: address1.trim(),
            address2: address2.trim() || undefined,
            city: city.trim(),
            province: 'TX',
            zip: zip.trim(),
            country: 'US',
          },
          deliveryPhone: phone.trim() || undefined,
          deliveryDate: deliveryDate || undefined,
          deliveryTime: deliveryTime || undefined,
          deliveryNotes: deliveryNotes.trim() || undefined,
        });
        onRefresh();
      }

      // Validate required fields
      const finalAddress = hasAddress ? tab.deliveryAddress.address1 : address1.trim();
      const finalZip = hasAddress ? tab.deliveryAddress.zip : zip.trim();
      if (!finalAddress || !finalZip) {
        setError('Delivery address is required');
        setLoading(false);
        return;
      }

      if (mode === 'mine') {
        const result = await checkoutParticipantV2(
          shareCode,
          tab.id,
          participantId,
          discountApplied?.code
        );
        window.location.href = result.checkoutUrl;
      } else {
        // checkout-all
        const res = await fetch(
          `/api/v2/group-orders/${shareCode}/tabs/${tab.id}/checkout-all`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId,
              discountCode: discountApplied?.code,
            }),
          }
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Checkout failed');
        window.location.href = json.data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  }

  const notesPlaceholder =
    CONTEXT_PLACEHOLDERS[tab.deliveryContextType] || CONTEXT_PLACEHOLDERS.OTHER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900">
            {mode === 'mine' ? 'Checkout' : 'Pay for Everything'}
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

          {/* Delivery details (if not yet filled) */}
          {!hasAddress && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900">
                Delivery Details
              </p>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Street address *"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
              />
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Apt, suite, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City *"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
                />
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="Zip *"
                  required
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
                />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number *"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
                />
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
                >
                  <option value="">Select time</option>
                  <option value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                  <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                  <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                </select>
              </div>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder={notesPlaceholder}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-blue focus:ring-0 transition-all"
              />
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
            disabled={loading || items.length === 0}
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
