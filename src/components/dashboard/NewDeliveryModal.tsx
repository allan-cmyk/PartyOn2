'use client';

import { useState, type ReactElement } from 'react';
import { createTabV2 } from '@/lib/group-orders-v2/api-client';

interface Props {
  shareCode: string;
  participantId: string;
  tabCount: number;
  onClose: () => void;
  onCreated: () => void;
}

const PARTY_LABELS: { value: string; label: string }[] = [
  { value: 'BOAT', label: 'Boat' },
  { value: 'BACH', label: 'Bach' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'HOTEL', label: 'B&B/Hotel' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewDeliveryModal({
  shareCode,
  participantId,
  tabCount,
  onClose,
  onCreated,
}: Props): ReactElement {
  const [selected, setSelected] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const label = PARTY_LABELS.find((p) => p.value === selected)?.label || '';
      const name = customName.trim() || `${label} Order`;
      await createTabV2(shareCode, {
        hostParticipantId: participantId,
        name,
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

        {tabCount >= 4 ? (
          <>
            <h2 className="text-xl font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-2">
              Maximum Locations Reached
            </h2>
            <p className="text-base text-gray-500 text-center mb-6">
              You can have up to 4 delivery locations per order. Remove an existing location to add a new one.
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-100 text-gray-700 text-lg font-semibold tracking-[0.08em] rounded-lg hover:bg-gray-200 transition-colors"
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-2">
              Add Another Location
            </h2>
            <p className="text-base text-gray-500 text-center mb-6">
              What are we celebrating at this location?
            </p>

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

            {selected && (
              <div className="mt-5">
                <label htmlFor="location-name" className="block text-base font-semibold text-gray-700 mb-1.5">
                  Name this order
                </label>
                <input
                  id="location-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`${PARTY_LABELS.find((p) => p.value === selected)?.label || ''} Order`}
                  className="input-premium w-full"
                  maxLength={100}
                  autoFocus
                />
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  );
}
