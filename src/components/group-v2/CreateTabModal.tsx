'use client';

import { useState, FormEvent, ReactElement } from 'react';
import { createTabV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  hostParticipantId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTabModal({
  shareCode,
  hostParticipantId,
  isOpen,
  onClose,
  onCreated,
}: Props): ReactElement | null {
  const [name, setName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('Austin');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createTabV2(shareCode, {
        hostParticipantId,
        name,
        deliveryDate,
        deliveryTime,
        deliveryAddress: {
          address1,
          city,
          province: 'TX',
          zip,
          country: 'US',
        },
        deliveryNotes: notes || undefined,
      });
      onCreated();
      onClose();
      // Reset form
      setName('');
      setDeliveryDate('');
      setDeliveryTime('');
      setAddress1('');
      setZip('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tab');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Delivery Tab</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tab Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Day 2 Delivery"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <select
                required
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500"
              >
                <option value="">Select</option>
                {['10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Street address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gold-500 mb-2"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
              <input type="text" value="TX" disabled className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-500" />
              <input
                type="text"
                required
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Zip"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Add Tab'}
          </button>
        </form>
      </div>
    </div>
  );
}
