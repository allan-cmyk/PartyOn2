'use client';

import { useState, type ReactElement } from 'react';
import { updateGroupOrderV2, updateTabV2 } from '@/lib/group-orders-v2/api-client';
import type { PartyType, DeliveryContextType } from '@/lib/group-orders-v2/types';

interface Props {
  shareCode: string;
  tabId: string;
  participantId: string;
  initialPartyType: PartyType | null;
  initialName: string;
  initialDeliveryContext: DeliveryContextType;
  onComplete: () => void;
  onDismiss: () => void;
}

const PARTY_TYPES: { value: PartyType; label: string }[] = [
  { value: 'BACHELOR', label: 'Bachelor Party' },
  { value: 'BACHELORETTE', label: 'Bachelorette' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate Event' },
  { value: 'HOUSE_PARTY', label: 'House Party' },
  { value: 'OTHER', label: 'Other' },
];

const DELIVERY_CONTEXTS: { value: DeliveryContextType; label: string }[] = [
  { value: 'HOUSE', label: 'House / BnB / Hotel' },
  { value: 'BOAT', label: 'Boat / Marina' },
  { value: 'VENUE', label: 'Business / Venue' },
  { value: 'OTHER', label: 'Apartment / Other' },
];

export default function OnboardingPopup({
  shareCode,
  tabId,
  participantId,
  initialPartyType,
  initialName,
  initialDeliveryContext,
  onComplete,
  onDismiss,
}: Props): ReactElement {
  const [step, setStep] = useState<1 | 2 | 3>(initialPartyType ? 2 : 1);
  const [partyType, setPartyType] = useState<PartyType | null>(initialPartyType);
  const [orderName, setOrderName] = useState(initialName);
  const [deliveryContext, setDeliveryContext] = useState<DeliveryContextType>(initialDeliveryContext);
  const [saving, setSaving] = useState(false);

  async function handlePartyType(type: PartyType) {
    setPartyType(type);
    setSaving(true);
    try {
      await updateGroupOrderV2(shareCode, { partyType: type });
    } catch {
      // Non-blocking
    }
    setSaving(false);
    setStep(2);
  }

  async function handleNameSave() {
    if (orderName.trim()) {
      setSaving(true);
      try {
        await updateGroupOrderV2(shareCode, { name: orderName.trim() });
      } catch {
        // Non-blocking
      }
      setSaving(false);
    }
    setStep(3);
  }

  async function handleDeliveryContext(ctx: DeliveryContextType) {
    setDeliveryContext(ctx);
    setSaving(true);
    try {
      await updateTabV2(shareCode, tabId, {
        hostParticipantId: participantId,
        deliveryContextType: ctx,
      });
    } catch {
      // Non-blocking
    }
    setSaving(false);
    onComplete();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-1">
          <p className="text-xs text-gray-400">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-4">
              What are you celebrating?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {PARTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => handlePartyType(pt.value)}
                  disabled={saving}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    partyType === pt.value
                      ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 block mx-auto"
            >
              Skip
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-4">
              Name your order
            </h2>
            <input
              type="text"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder={
                partyType === 'BACHELOR'
                  ? "Bob's Bachelor Party"
                  : partyType === 'BACHELORETTE'
                  ? "Sarah's Bachelorette"
                  : partyType === 'CORPORATE'
                  ? 'Q1 Team Offsite'
                  : 'My Party Order'
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
              }}
              autoFocus
            />
            <button
              onClick={handleNameSave}
              disabled={saving}
              className="mt-4 w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
            <button
              onClick={() => setStep(3)}
              className="mt-2 text-sm text-gray-400 hover:text-gray-600 block mx-auto"
            >
              Skip
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-4">
              Where should we deliver?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_CONTEXTS.map((ctx) => (
                <button
                  key={ctx.value}
                  onClick={() => handleDeliveryContext(ctx.value)}
                  disabled={saving}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    deliveryContext === ctx.value
                      ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {ctx.label}
                </button>
              ))}
            </div>
            <button
              onClick={onDismiss}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 block mx-auto"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
