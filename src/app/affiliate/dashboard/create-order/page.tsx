'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import Link from 'next/link';

const PARTY_TYPES = [
  { value: 'BOAT', label: 'Boat' },
  { value: 'BACH', label: 'Bach' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'HOUSE_PARTY', label: 'Private' },
  { value: 'OTHER', label: 'Other' },
];

const DELIVERY_CONTEXTS = [
  { value: 'HOUSE', label: 'House' },
  { value: 'BOAT', label: 'Boat / Marina' },
  { value: 'VENUE', label: 'Venue' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'OTHER', label: 'Other' },
];

export default function CreatePartnerOrderPage(): ReactElement {
  const [clientName, setClientName] = useState('');
  const [tabName, setTabName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [partyType, setPartyType] = useState('');
  const [deliveryContext, setDeliveryContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ dashboardUrl: string; shareCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/affiliate/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          tabName: tabName.trim() || undefined,
          deliveryAddress: deliveryAddress.trim() || undefined,
          deliveryDate: deliveryDate || undefined,
          partyType: partyType || undefined,
          deliveryContextType: deliveryContext || undefined,
        }),
      });

      if (res.status === 401) {
        window.location.href = '/affiliate/dashboard';
        return;
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSuccessData({
        dashboardUrl: json.data.dashboardUrl,
        shareCode: json.data.shareCode,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!successData) return;
    navigator.clipboard.writeText(successData.dashboardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (successData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-heading font-bold tracking-[0.04em] text-gray-900">
              Order Created
            </h1>
            <Link
              href="/affiliate/dashboard/orders"
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Back to Orders
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                Order ready for {clientName}
              </p>
              <p className="text-sm text-gray-500">
                Share this link with your client so they can browse and order.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Order Link</p>
              <p className="text-sm text-gray-900 break-all font-mono">
                {successData.dashboardUrl}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <div className="flex gap-3">
              <Link
                href={`/dashboard/${successData.shareCode}`}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-brand-blue border-2 border-brand-blue rounded-lg hover:bg-blue-50 transition-colors"
              >
                Open Order
              </Link>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setClientName('');
                  setTabName('');
                  setDeliveryAddress('');
                  setDeliveryDate('');
                  setPartyType('');
                  setDeliveryContext('');
                  setLoading(false);
                }}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold tracking-[0.04em] text-gray-900">
            Create Client Order
          </h1>
          <Link
            href="/affiliate/dashboard/orders"
            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Madison & Dane"
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Tab Name
              </label>
              <input
                type="text"
                value={tabName}
                onChange={(e) => setTabName(e.target.value)}
                placeholder="e.g. Lake Travis Boat Party"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Defaults to &ldquo;Location 1&rdquo; if blank</p>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Delivery Address
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. 1234 Lake Shore Dr, Austin TX 78732"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-1.5">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Party Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PARTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setPartyType(partyType === pt.value ? '' : pt.value)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      partyType === pt.value
                        ? 'border-brand-yellow bg-yellow-50 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Delivery Location Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DELIVERY_CONTEXTS.map((dc) => (
                  <button
                    key={dc.value}
                    type="button"
                    onClick={() => setDeliveryContext(deliveryContext === dc.value ? '' : dc.value)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      deliveryContext === dc.value
                        ? 'border-brand-yellow bg-yellow-50 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {dc.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !clientName.trim()}
              className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Your client will get free delivery automatically.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
