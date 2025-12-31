'use client';

import type { ReactElement } from 'react';
import type { SpiritType, WeddingTier, SpiritLevel } from '@/lib/wedding-packages/types';
import { ALL_SPIRIT_TYPES, getTierConfig, SPIRIT_PRODUCTS } from '@/lib/wedding-packages';

interface SpiritPickerProps {
  selectedSpirits: SpiritType[];
  onSpiritsChange: (spirits: SpiritType[]) => void;
  tier: WeddingTier;
}

/** Display names for spirit types */
const SPIRIT_LABELS: Record<SpiritType, string> = {
  vodka: 'Vodka',
  tequila: 'Tequila',
  whiskey: 'Whiskey',
  gin: 'Gin',
  rum: 'Rum',
};

/** Bottle icon for spirits */
function SpiritIcon(): ReactElement {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 3h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V3zM8 6h8v2l1 2v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9l1-2V6z"
      />
    </svg>
  );
}

/**
 * Spirit type selector - Pick 3 checkboxes
 * Only shown for tiers that require spirit selection (not beer-wine, not deluxe)
 */
export default function SpiritPicker({
  selectedSpirits,
  onSpiritsChange,
  tier,
}: SpiritPickerProps): ReactElement | null {
  const tierConfig = getTierConfig(tier);

  // Don't render for beer & wine tier (no spirits)
  if (tierConfig.spirits.level === null) {
    return null;
  }

  // Don't render for deluxe tier (gets all spirits automatically)
  if (tierConfig.spirits.pickCount === 'all') {
    return (
      <div className="p-4 bg-gold-50 rounded-lg border border-gold-200">
        <p className="text-sm text-gold-700 font-medium mb-2">
          Deluxe Bar includes all 5 premium spirits:
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_SPIRIT_TYPES.map((spirit) => {
            const product = SPIRIT_PRODUCTS[tierConfig.spirits.level as SpiritLevel][spirit];
            return (
              <span
                key={spirit}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-gray-700"
              >
                <SpiritIcon />
                {product.name}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  const maxSelections = tierConfig.spirits.pickCount as number;
  const spiritLevel = tierConfig.spirits.level as SpiritLevel;

  const handleSpiritToggle = (spirit: SpiritType): void => {
    if (selectedSpirits.includes(spirit)) {
      // Remove spirit
      onSpiritsChange(selectedSpirits.filter((s) => s !== spirit));
    } else if (selectedSpirits.length < maxSelections) {
      // Add spirit (if under limit)
      onSpiritsChange([...selectedSpirits, spirit]);
    }
  };

  const isAtLimit = selectedSpirits.length >= maxSelections;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 tracking-[0.1em] uppercase">
          Choose Your Spirits
        </label>
        <span className={`text-sm ${isAtLimit ? 'text-gold-600 font-medium' : 'text-gray-500'}`}>
          {selectedSpirits.length} / {maxSelections} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ALL_SPIRIT_TYPES.map((spirit) => {
          const isSelected = selectedSpirits.includes(spirit);
          const isDisabled = !isSelected && isAtLimit;
          const product = SPIRIT_PRODUCTS[spiritLevel][spirit];

          return (
            <button
              key={spirit}
              onClick={() => handleSpiritToggle(spirit)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-lg border-2 text-center transition-all duration-200
                ${isSelected
                  ? 'border-gold-600 bg-gold-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Checkmark for selected */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`mx-auto mb-2 ${isSelected ? 'text-gold-600' : 'text-gray-400'}`}>
                <SpiritIcon />
              </div>

              {/* Label */}
              <div className={`font-medium text-sm ${isSelected ? 'text-gold-700' : 'text-gray-700'}`}>
                {SPIRIT_LABELS[spirit]}
              </div>

              {/* Brand name */}
              <div className="text-xs text-gray-500 mt-1 truncate">
                {product.name.split(' ').slice(0, 2).join(' ')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Validation message */}
      {selectedSpirits.length < maxSelections && (
        <p className="text-sm text-amber-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Please select {maxSelections - selectedSpirits.length} more spirit{maxSelections - selectedSpirits.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
