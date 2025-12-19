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
 * Tier selection cards for the 5 wedding package options
 * Shows tier name, price per person, and estimated total
 */
export default function TierSelector({
  selectedTier,
  onTierChange,
  guestCount,
}: TierSelectorProps): ReactElement {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 tracking-[0.1em] uppercase">
        Select Your Package
      </label>

      {/* Mobile: Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:hidden snap-x snap-mandatory">
        {TIER_ORDER.map((tierId) => {
          const tier = getTierConfig(tierId);
          const isSelected = selectedTier === tierId;
          const estimatedTotal = getEstimatedTotal(guestCount, tierId);

          return (
            <button
              key={tierId}
              onClick={() => onTierChange(tierId)}
              className={`
                flex-shrink-0 w-[160px] p-4 rounded-lg border-2 text-left
                transition-all duration-200 snap-center
                ${isSelected
                  ? 'border-gold-600 bg-gold-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="text-xs text-gray-500 tracking-[0.05em] uppercase mb-1">
                ${tier.pricePerPerson}/person
              </div>
              <div className={`font-serif text-base mb-2 ${isSelected ? 'text-gold-700' : 'text-gray-900'}`}>
                {tier.name.replace('The ', '')}
              </div>
              <div className="text-sm text-gray-600">
                ~${estimatedTotal.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid md:grid-cols-5 gap-4">
        {TIER_ORDER.map((tierId) => {
          const tier = getTierConfig(tierId);
          const isSelected = selectedTier === tierId;
          const estimatedTotal = getEstimatedTotal(guestCount, tierId);

          return (
            <button
              key={tierId}
              onClick={() => onTierChange(tierId)}
              className={`
                p-5 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected
                  ? 'border-gold-600 bg-gold-50 shadow-lg transform scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {/* Price Badge */}
              <div className={`
                inline-block px-2 py-1 rounded text-xs font-medium tracking-[0.05em] mb-3
                ${isSelected ? 'bg-gold-600 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                ${tier.pricePerPerson}/person
              </div>

              {/* Tier Name */}
              <h3 className={`font-serif text-lg mb-2 ${isSelected ? 'text-gold-700' : 'text-gray-900'}`}>
                {tier.name.replace('The ', '')}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {tier.description}
              </p>

              {/* Estimated Total */}
              <div className={`
                text-lg font-medium
                ${isSelected ? 'text-gold-700' : 'text-gray-700'}
              `}>
                ~${estimatedTotal.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">estimated total</div>
            </button>
          );
        })}
      </div>

      {/* Selected Tier Details */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-serif text-lg text-gray-900 mb-3">
          {getTierConfig(selectedTier).name} Includes:
        </h4>
        <ul className="space-y-2">
          {getTierConfig(selectedTier).features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5"
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
  );
}
