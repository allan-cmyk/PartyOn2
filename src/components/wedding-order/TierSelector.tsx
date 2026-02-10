'use client';

import type { ReactElement } from 'react';
import type { WeddingTier } from '@/lib/wedding-packages/types';
import { TIER_ORDER, getTierConfig, getEstimatedTotal } from '@/lib/wedding-packages';

interface TierSelectorProps {
  selectedTier: WeddingTier;
  onTierChange: (tier: WeddingTier) => void;
  guestCount: number;
}

/**
 * Tier selection tabs for the 5 wedding package options
 * Simple tabs with names, detailed info shown below when selected
 */
export default function TierSelector({
  selectedTier,
  onTierChange,
  guestCount,
}: TierSelectorProps): ReactElement {
  const selectedConfig = getTierConfig(selectedTier);
  const estimatedTotal = getEstimatedTotal(guestCount, selectedTier);

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-gray-700 tracking-[0.1em] uppercase">
        Select Your Package
      </label>

      {/* Tier Tabs - Simple name buttons */}
      <div className="flex flex-wrap gap-2">
        {TIER_ORDER.map((tierId) => {
          const tier = getTierConfig(tierId);
          const isSelected = selectedTier === tierId;

          return (
            <button
              key={tierId}
              onClick={() => onTierChange(tierId)}
              className={`
                px-4 py-3 rounded-lg border-2 text-sm font-medium
                transition-all duration-200
                ${isSelected
                  ? 'border-brand-yellow bg-brand-yellow text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {tier.name}
            </button>
          );
        })}
      </div>

      {/* Selected Tier Details */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        {/* Header with name and pricing */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading text-2xl text-gray-900 mb-2">
              {selectedConfig.name}
            </h3>
            <p className="text-gray-600">
              {selectedConfig.description}
            </p>
          </div>

          {/* Pricing Summary */}
          <div className="sm:text-right flex-shrink-0">
            <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-2">
              ${selectedConfig.pricePerPerson}/person avg.
            </div>
            <div className="text-2xl font-heading text-gray-900">
              ~${estimatedTotal.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              estimated for {guestCount} guests
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 tracking-[0.1em] uppercase mb-3">
            What&apos;s Included
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedConfig.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <svg
                  className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
