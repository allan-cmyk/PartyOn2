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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-yellow shadow-lg pb-safe">
      <div className="flex justify-center px-4 py-3">
        <button
          onClick={openCart}
          className="inline-flex items-center gap-2 border-2 border-gray-900 rounded-lg px-5 py-2.5 text-gray-900 font-semibold text-sm hover:bg-gray-900 hover:text-white transition-colors"
        >
          View Cart ({itemCount}) &middot; {total ? formatPrice(total.amount, total.currencyCode) : '$0.00'}
        </button>
      </div>
    </div>
  );
}
