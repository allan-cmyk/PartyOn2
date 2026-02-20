'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { updateTabV2 } from '@/lib/group-orders-v2/api-client';
import type { SubOrderFull } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  tab: SubOrderFull;
  participantId: string;
  onClose: () => void;
  onSaved: () => void;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 30]) {
      const hour = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const nextH = m === 30 ? h + 1 : h;
      const nextM = m === 30 ? 0 : 30;
      const nextHour = nextH % 12 || 12;
      const nextAmpm = nextH < 12 ? 'AM' : 'PM';
      const start = `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
      const end = `${nextHour}:${nextM.toString().padStart(2, '0')} ${nextAmpm}`;
      slots.push(`${start} - ${end}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

function isSunday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 0;
}

export default function DeliveryDetailsModal({
  shareCode,
  tab,
  participantId,
  onClose,
  onSaved,
}: Props): ReactElement {
  const addr = tab.deliveryAddress || { address1: '', address2: '', city: '', province: 'TX', zip: '', country: 'US' };

  const [date, setDate] = useState(tab.deliveryDate !== 'TBD' ? tab.deliveryDate : '');
  const [time, setTime] = useState(tab.deliveryTime !== 'TBD' ? tab.deliveryTime : '');
  const [address1, setAddress1] = useState(addr.address1 || '');
  const [address2, setAddress2] = useState(addr.address2 || '');
  const [city, setCity] = useState(addr.city || '');
  const [zip, setZip] = useState(addr.zip || '');
  const [notes, setNotes] = useState(tab.deliveryNotes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Please select a delivery date.');
      return;
    }
    if (isSunday(date)) {
      setError('We do not deliver on Sundays. Please pick another date.');
      return;
    }
    if (!time) {
      setError('Please select a delivery time.');
      return;
    }
    if (!address1.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter a city.');
      return;
    }
    if (!zip.trim()) {
      setError('Please enter a zip code.');
      return;
    }

    setSaving(true);
    try {
      await updateTabV2(shareCode, tab.id, {
        hostParticipantId: participantId,
        deliveryDate: date,
        deliveryTime: time,
        deliveryAddress: {
          address1: address1.trim(),
          address2: address2.trim() || undefined,
          city: city.trim(),
          province: 'TX',
          zip: zip.trim(),
          country: 'US',
        },
        deliveryNotes: notes.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900">
            Delivery Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={date}
                min={getMinDate()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
              >
                <option value="">Select a time window</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Street address"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Apt, suite, unit, etc."
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="78701"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gate code, special instructions, etc."
              rows={3}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-base focus:border-brand-blue focus:ring-0 transition-all hover:border-gray-300 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
