'use client';

import type { ReactElement } from 'react';
import type { CalculatedPackage, CalculatedItem } from '@/lib/wedding-packages/types';

interface PackageBreakdownProps {
  calculation: CalculatedPackage;
  isLoading: boolean;
  onAddToCart: () => void;
  validationError: string | null;
}

/** Group items by category for display */
function groupItemsByCategory(items: CalculatedItem[]): Record<string, CalculatedItem[]> {
  const groups: Record<string, CalculatedItem[]> = {};

  for (const item of items) {
    const category = item.product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  }

  return groups;
}

/** Category display order and labels */
const CATEGORY_ORDER = ['champagne', 'wine', 'spirits', 'beer'];
const CATEGORY_LABELS: Record<string, string> = {
  champagne: 'Champagne Toast',
  wine: 'Wine Selection',
  spirits: 'Spirits',
  beer: 'Beer Selection',
};

/**
 * Package breakdown showing all items, quantities, and totals
 * Includes Add to Cart button
 */
export default function PackageBreakdown({
  calculation,
  isLoading,
  onAddToCart,
  validationError,
}: PackageBreakdownProps): ReactElement {
  const groupedItems = groupItemsByCategory(calculation.items);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4">
        <h3 className="font-heading text-xl tracking-[0.1em]">
          Your {calculation.tier.name}
        </h3>
        <p className="text-gray-300 text-sm mt-1">
          {calculation.guestCount} guests • {calculation.eventHours} hours
        </p>
      </div>

      {/* Items by Category */}
      <div className="divide-y divide-gray-100">
        {CATEGORY_ORDER.map((category) => {
          const items = groupedItems[category];
          if (!items || items.length === 0) return null;

          return (
            <div key={category} className="p-4">
              <h4 className="text-xs font-medium text-gray-500 tracking-[0.1em] uppercase mb-3">
                {CATEGORY_LABELS[category]}
              </h4>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`${item.product.handle}-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.product.unitLabel} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.subtotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="bg-gray-50 px-6 py-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${calculation.totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Avg. price per person</span>
          <span className="text-gray-900">~${calculation.pricePerPerson.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total items</span>
          <span className="text-gray-900">{calculation.totalBottles} bottles/packs</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Estimated Total</span>
            <span className="text-2xl font-heading text-yellow-600">
              ${calculation.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="px-6 pb-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {validationError}
            </p>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="px-6 pb-6">
        <button
          onClick={onAddToCart}
          disabled={isLoading || !!validationError}
          className={`
            w-full py-4 rounded-lg font-medium tracking-[0.1em] uppercase
            transition-all duration-200 flex items-center justify-center gap-2
            ${isLoading || validationError
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-yellow text-white hover:bg-yellow-600 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding to Cart...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add Package to Cart
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Prices are estimates. Final prices may vary based on availability.
        </p>
      </div>
    </div>
  );
}
