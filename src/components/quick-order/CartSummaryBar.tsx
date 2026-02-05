/**
 * @fileoverview Sticky bottom cart summary bar for Quick Order page
 * @module components/quick-order/CartSummaryBar
 */

'use client';

import type { ReactElement } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

/**
 * Fixed bottom bar showing cart summary with checkout button
 *
 * Only visible when cart has items. Shows item count and total,
 * opens cart drawer on click.
 */
export default function CartSummaryBar(): ReactElement | null {
  const { cart, openCart } = useCartContext();

  const itemCount = cart?.totalQuantity ?? 0;
  const total = cart?.cost?.subtotalAmount;

  // Don't render if cart is empty
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 border-t border-brand-yellow shadow-lg pb-safe">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <button
          onClick={openCart}
          className="w-full flex items-center justify-between bg-yellow-500 hover:bg-brand-yellow text-gray-900 rounded-lg px-4 py-3 transition-colors"
        >
          {/* Left: Cart icon and item count */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-gray-900 text-yellow-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <span className="font-semibold">View Cart</span>
          </div>

          {/* Right: Total price */}
          <span className="font-bold text-lg">
            {total ? formatPrice(total.amount, total.currencyCode) : '$0.00'}
          </span>
        </button>
      </div>
    </div>
  );
}
