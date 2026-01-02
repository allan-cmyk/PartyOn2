/**
 * @fileoverview Reusable quantity stepper component for Quick Order
 * @module components/quick-order/QuantityStepper
 */

'use client';

import type { ReactElement } from 'react';

interface QuantityStepperProps {
  /** Current quantity value */
  quantity: number;
  /** Handler for increment button */
  onIncrement: () => void;
  /** Handler for decrement button */
  onDecrement: () => void;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Quantity stepper with +/- buttons and quantity display
 *
 * @example
 * ```tsx
 * <QuantityStepper
 *   quantity={3}
 *   onIncrement={() => updateQty(4)}
 *   onDecrement={() => updateQty(2)}
 * />
 * ```
 */
export default function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
  size = 'md',
}: QuantityStepperProps): ReactElement {
  const sizeClasses = {
    xs: { button: 'w-6 h-6', font: 'text-xs', minWidth: 'min-w-[20px]', icon: 'w-3 h-3' },
    sm: { button: 'w-7 h-7', font: 'text-sm', minWidth: 'min-w-[28px]', icon: 'w-4 h-4' },
    md: { button: 'w-9 h-9', font: 'text-base', minWidth: 'min-w-[28px]', icon: 'w-4 h-4' },
  };
  const { button: buttonSize, font: fontSize, minWidth, icon: iconSize } = sizeClasses[size];

  return (
    <div className="flex items-center gap-1 bg-white rounded-full border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        disabled={disabled || quantity <= 1}
        className={`${buttonSize} flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Decrease quantity"
      >
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>

      <span
        className={`${fontSize} font-semibold text-gray-900 ${minWidth} text-center`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={disabled}
        className={`${buttonSize} flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Increase quantity"
      >
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
