'use client';

import { useState, useEffect, type ReactElement, type RefObject } from 'react';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';

interface Props {
  participantId: string;
  draftItems: DraftCartItemView[];
  isLocked?: boolean;
  cartRef: RefObject<HTMLDivElement | null>;
  onCheckout: () => void;
}

export default function DashboardBottomBar({
  participantId,
  draftItems,
  isLocked,
  cartRef,
  onCheckout,
}: Props): ReactElement | null {
  const [cartVisible, setCartVisible] = useState(true);

  useEffect(() => {
    const target = cartRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCartVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [cartRef]);

  const myItems = draftItems.filter((i) => i.addedBy.id === participantId);
  const totalQty = myItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Hide when cart is visible in viewport, or no items
  if (cartVisible || (totalQty === 0 && !isLocked)) return null;

  function scrollToCart() {
    cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (isLocked) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center">
          <div className="flex items-center gap-2 text-base font-semibold text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Order Locked
            {totalQty > 0 && (
              <span className="text-gray-500 font-normal ml-2">
                {totalQty} item{totalQty !== 1 ? 's' : ''} - ${totalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={scrollToCart}
          className="flex items-center gap-2 text-base font-medium text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Back to Cart ({totalQty})
        </button>
        <button
          onClick={onCheckout}
          className="px-6 py-3 bg-brand-yellow text-gray-900 font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors text-base"
        >
          Checkout - ${totalPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
