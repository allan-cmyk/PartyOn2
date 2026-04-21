'use client';

import { useState, ReactElement } from 'react';

type Mode = 'existing' | 'external';

interface Props {
  affiliateId: string;
  onLinked: () => void;
}

/**
 * Admin-only UI for retroactively attributing an order to an affiliate.
 * - "Existing order" mode: enter an order number, creates an APPROVED commission.
 * - "External order" mode: create a placeholder Order for a sale captured
 *    outside the platform (e.g. DTR handed off a booking via another system).
 */
export default function LinkPastOrderSection({ affiliateId, onLinked }: Props): ReactElement {
  const [mode, setMode] = useState<Mode>('existing');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [orderNumber, setOrderNumber] = useState('');

  const [label, setLabel] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');

  async function submit(): Promise<void> {
    setSubmitting(true);
    setMessage(null);
    try {
      const body = mode === 'existing'
        ? { mode, orderNumber: Number(orderNumber) }
        : { mode, label, totalAmount: Number(totalAmount), eventDate, notes: notes || undefined };
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/link-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ kind: 'error', text: data.error || 'Failed to link order' });
        return;
      }
      const commission = data.data?.commission;
      const commissionAmt = commission
        ? `$${(commission.commissionAmountCents / 100).toFixed(2)}`
        : '$0.00 (no commission row created)';
      setMessage({
        kind: 'success',
        text: `Linked order #${data.data?.order?.orderNumber}. Commission: ${commissionAmt}.`,
      });
      setOrderNumber('');
      setLabel('');
      setTotalAmount('');
      setEventDate('');
      setNotes('');
      onLinked();
    } catch {
      setMessage({ kind: 'error', text: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = mode === 'existing'
    ? orderNumber.trim().length > 0 && !submitting
    : label.trim().length > 0 && totalAmount.trim().length > 0 && eventDate.length > 0 && !submitting;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Link Past Order</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() => { setMode('existing'); setMessage(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mode === 'existing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Existing order #
          </button>
          <button
            type="button"
            onClick={() => { setMode('external'); setMessage(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mode === 'external' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            External (captured elsewhere)
          </button>
        </div>

        {mode === 'existing' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Stamps the existing order with this affiliate and creates an APPROVED commission.
              Use this when an order was paid through the site but didn&apos;t capture the affiliate link.
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-[200px]">
                <label className="block text-sm text-gray-700 mb-1" htmlFor="order-number-input">Order number</label>
                <input
                  id="order-number-input"
                  type="number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. 144"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Linking...' : 'Link Order'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Creates a placeholder Order record for a sale captured outside Party On Delivery
              (e.g. a booking tracked in another system) and attributes it to this affiliate.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="ext-label-input">Label (shown as customer name)</label>
                <input
                  id="ext-label-input"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Rice/Gaudreau Wedding"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="ext-amount-input">Total amount ($)</label>
                <input
                  id="ext-amount-input"
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="839.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="ext-date-input">Event date</label>
                <input
                  id="ext-date-input"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="ext-notes-input">Notes (optional)</label>
                <input
                  id="ext-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Captured in Square"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create External Order'}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`mt-3 text-sm rounded-lg px-3 py-2 ${
              message.kind === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
