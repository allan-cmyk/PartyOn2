'use client';

import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react';
import Image from 'next/image';
import type { GroupOrderV2Full, SubOrderFull } from '@/lib/group-orders-v2/types';
import type { Product } from '@/lib/types/product';
import { addDraftItemV2 } from '@/lib/group-orders-v2/api-client';
import ProductDetailModal from './ProductDetailModal';

const SURVIVAL_PACKAGE = {
  productId: '26fe5ebe-4940-42c5-933e-7748b4050b79',
  variantId: 'd69300f4-9e68-4baa-86bc-aa57caf781b8',
  title: 'Welcome to Austin Survival Package',
  image: '/images/products/welcome-to-austin-survival-package.png',
  handle: 'party-starter-bundle',
};
const UNLOCK_THRESHOLD = 300;

interface Props {
  groupOrder: GroupOrderV2Full;
  activeTab: SubOrderFull;
  participantId: string;
  shareCode: string;
  onItemChanged: () => void;
}

export default function SurvivalPackageBanner({
  groupOrder,
  activeTab,
  participantId,
  shareCode,
  onItemChanged,
}: Props): ReactElement | null {
  const [product, setProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const autoAddTriggered = useRef(false);
  const noop = useCallback(() => {}, []);

  // Derived state (computed before hooks so hooks can reference them)
  const isPremier = groupOrder.affiliate?.code === 'PREMIER';
  const isBoatTab =
    activeTab.deliveryContextType === 'BOAT' || activeTab.partyType === 'BOAT';
  const visible = isPremier && !isBoatTab;

  const alreadyIncluded = groupOrder.tabs.some((tab) =>
    tab.draftItems.some(
      (item) => item.variantId === SURVIVAL_PACKAGE.variantId && item.price === 0
    )
  );

  const subtotal = activeTab.draftItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const remaining = UNLOCK_THRESHOLD - subtotal;
  const progress = Math.min(subtotal / UNLOCK_THRESHOLD, 1);

  // Fetch product data for the modal
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${SURVIVAL_PACKAGE.handle}`);
        const json = await res.json();
        if (!cancelled && json.success && json.data) {
          setProduct(json.data);
        }
      } catch {
        // Product fetch failed -- modal just won't be available
      }
    }
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  // Auto-add when threshold is reached
  useEffect(() => {
    if (
      !visible ||
      alreadyIncluded ||
      subtotal < UNLOCK_THRESHOLD ||
      autoAddTriggered.current
    ) {
      return;
    }

    autoAddTriggered.current = true;
    setAdding(true);

    addDraftItemV2(shareCode, activeTab.id, {
      participantId,
      productId: SURVIVAL_PACKAGE.productId,
      variantId: SURVIVAL_PACKAGE.variantId,
      title: SURVIVAL_PACKAGE.title,
      price: 0,
      quantity: 1,
      imageUrl: SURVIVAL_PACKAGE.image,
    })
      .then(() => {
        onItemChanged();
      })
      .catch(() => {
        // Reset so it can retry on next render
        autoAddTriggered.current = false;
      })
      .finally(() => {
        setAdding(false);
      });
  }, [
    visible,
    subtotal,
    alreadyIncluded,
    shareCode,
    activeTab.id,
    participantId,
    onItemChanged,
  ]);

  // Gate: only show for Premier affiliate orders on non-boat tabs
  if (!visible) {
    return null;
  }

  // Already included -- show compact confirmation
  if (alreadyIncluded) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-4">
        <svg
          className="w-5 h-5 text-emerald-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm text-emerald-800 font-medium">
          FREE {SURVIVAL_PACKAGE.title} included with your order
        </span>
      </div>
    );
  }

  // Adding in progress
  if (adding) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
        <svg
          className="w-5 h-5 text-emerald-600 animate-spin flex-shrink-0"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm text-emerald-800 font-semibold">
          Unlocked! Adding to your cart...
        </span>
      </div>
    );
  }

  // Under threshold -- show progress banner
  return (
    <>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={SURVIVAL_PACKAGE.image}
              alt={SURVIVAL_PACKAGE.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => product && setShowModal(true)}
              className="text-left text-emerald-800 font-semibold underline hover:text-emerald-900 transition-colors text-sm"
            >
              {SURVIVAL_PACKAGE.title}
            </button>
            <p className="text-xs text-emerald-700 mt-0.5">
              Hangover kit for the crew -- ice, Gatorade, cups, snacks &amp; more
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-emerald-700 mt-1.5 font-medium">
            Spend ${remaining.toFixed(2)} more to unlock your FREE survival package!
          </p>
        </div>
      </div>

      {showModal && product && (
        <ProductDetailModal
          product={product}
          onClose={() => setShowModal(false)}
          onAddToCart={noop}
          qty={0}
          busy={false}
          available={true}
          isLocked={true}
          onIncrement={noop}
          onDecrement={noop}
        />
      )}
    </>
  );
}
