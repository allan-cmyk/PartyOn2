'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import { updateGroupOrderV2, updateTabV2 } from '@/lib/group-orders-v2/api-client';
import type { PartyType } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  firstTabId?: string;
  participantId: string;
  onComplete: () => void;
  onDismiss: () => void;
}

const PARTY_TYPES: { value: PartyType; label: string }[] = [
  { value: 'BOAT', label: 'Boat Party' },
  { value: 'BACH', label: 'Bach Weekend' },
  { value: 'HOUSE_PARTY', label: 'House Party' },
  { value: 'CORPORATE', label: 'Corporate Event' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'OTHER', label: 'Other' },
];

export default function OnboardingPopup({
  shareCode,
  firstTabId,
  participantId,
  onComplete,
  onDismiss,
}: Props): ReactElement {
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<PartyType | null>(null);
  const [orderName, setOrderName] = useState('');
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step]);

  async function handleFinish(skipName?: boolean) {
    const data: { partyType?: string; name?: string } = {};
    if (selected) data.partyType = selected;
    if (!skipName && orderName.trim()) data.name = orderName.trim();

    if (Object.keys(data).length === 0) {
      onComplete();
      return;
    }

    setSaving(true);
    try {
      await updateGroupOrderV2(shareCode, data as { partyType?: string; name?: string });
      if (selected && firstTabId) {
        await updateTabV2(shareCode, firstTabId, {
          participantId,
          partyType: selected as PartyType,
        });
      }
    } catch {
      // Non-blocking
    }
    setSaving(false);
    onComplete();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-8 relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-brand-blue' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-brand-blue' : 'bg-gray-300'}`} />
        </div>

        {step === 1 && (
          <>
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-6">
              What type of party is this for?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PARTY_TYPES.map((pt) => (
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

            <button
              onClick={() => setStep(2)}
              disabled={!selected || saving}
              className="mt-6 w-full py-4 bg-brand-blue text-white text-lg font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl md:text-2xl font-heading font-bold tracking-[0.08em] text-gray-900 text-center mb-2">
              What should we call your party page?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              This is what your guests will see when they open the link.
            </p>

            <input
              ref={nameInputRef}
              type="text"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="Bob's Bachelor Party"
              disabled={saving}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-brand-blue focus:ring-0 transition-colors placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinish();
              }}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleFinish(true)}
                disabled={saving}
                className="flex-1 py-4 text-base font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => handleFinish()}
                disabled={saving}
                className="flex-1 py-4 bg-brand-blue text-white text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'SAVE'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
