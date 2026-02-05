'use client';

import { useState, ReactElement } from 'react';
import { createDeliveryInvoice } from '@/lib/group-orders-v2/api-client';
import type { SubOrderFull } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  tab: SubOrderFull;
  hostParticipantId: string;
}

export default function DeliveryFeeInvoice({
  shareCode,
  tab,
  hostParticipantId,
}: Props): ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (tab.deliveryFeeWaived) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
        Delivery fee waived for this tab.
      </div>
    );
  }

  if (tab.deliveryInvoice?.status === 'PAID') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
        Delivery fee paid (${Number(tab.deliveryInvoice.total ?? 0).toFixed(2)})
      </div>
    );
  }

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await createDeliveryInvoice(
        shareCode,
        tab.id,
        hostParticipantId
      );
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Delivery Fee: ${Number(tab.deliveryFee ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            Host is responsible for the delivery fee.
          </p>
        </div>
        <button
          onClick={handlePay}
          disabled={loading}
          className="px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Delivery Fee'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
