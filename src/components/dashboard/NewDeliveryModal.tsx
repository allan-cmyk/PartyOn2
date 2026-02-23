'use client';

import { useState, type ReactElement } from 'react';
import { createTabV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  participantId: string;
  nextPosition: number;
  onClose: () => void;
  onCreated: () => void;
}

const PARTY_LABELS: { value: string; label: string }[] = [
  { value: 'BOAT', label: 'Boat' },
  { value: 'BACH', label: 'Bach' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'HOUSE_PARTY', label: 'Private' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewDeliveryModal({
  shareCode,
  participantId,
  nextPosition,
  onClose,
  onCreated,
}: Props): ReactElement {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await createTabV2(shareCode, {
        hostParticipantId: participantId,
        name: `Location ${nextPosition}`,
        deliveryDate: 'TBD',
        deliveryTime: 'TBD',
        deliveryAddress: {
          address1: '',
          city: '',
          province: 'TX',
          zip: '',
          country: 'US',
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create location.');
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
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-6">
          Add Another Location
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PARTY_LABELS.map((pt) => (
            <button
              key={pt.value}
              onClick={() => setSelected(pt.value)}
              disabled={saving}
              className={`p-4 rounded-xl border-2 text-base font-semibold transition-all ${
                selected === pt.value
                  ? 'border-brand-yellow bg-yellow-50 text-gray-900 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-4">{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={!selected || saving}
          className="mt-6 w-full py-4 bg-brand-blue text-white text-lg font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Creating...' : 'ADD LOCATION'}
        </button>
      </div>
    </div>
  );
}
