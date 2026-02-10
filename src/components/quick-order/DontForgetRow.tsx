'use client';

import { useState, useCallback, useEffect, type ReactElement } from 'react';
import Image from 'next/image';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import { useCartContext } from '@/contexts/CartContext';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant } from '@/lib/utils';
import { BOAT_ESSENTIALS_HANDLE } from '@/lib/products/premier-collections';
import type { Product } from '@/lib/types';
import QuantityStepper from './QuantityStepper';

function CompactCard({ product }: { product: Product }): ReactElement {
  const { cart, addToCart, updateCartItem, removeFromCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [optimisticQty, setOptimisticQty] = useState<number | null>(null);

  const variant = getFirstAvailableVariant(product);
  const variantId = variant?.id ?? product.variants.edges[0]?.node.id;
  const price = variant?.price ?? product.variants.edges[0]?.node.price;
  const isAvailable = variant?.availableForSale ?? false;

  const cartLine = cart?.lines?.edges?.find(
    (e) => e.node.merchandise.id === variantId
  )?.node;
  const cartQuantity = cartLine?.quantity ?? 0;
  const lineId = cartLine?.id;

  useEffect(() => {
    if (optimisticQty !== null && cartQuantity === optimisticQty) {
      setOptimisticQty(null);
    }
  }, [cartQuantity, optimisticQty]);

  const displayQty = optimisticQty ?? cartQuantity;

  const handleAdd = useCallback(async () => {
    if (!variantId || isAdding) return;
    setIsAdding(true);
    setOptimisticQty(1);
    try {
      await addToCart(variantId, 1);
    } catch {
      setOptimisticQty(null);
    } finally {
      setIsAdding(false);
    }
  }, [variantId, addToCart, isAdding]);

  const handleIncrement = useCallback(async () => {
    if (!lineId || isAdding) return;
    const newQty = displayQty + 1;
    setOptimisticQty(newQty);
    try {
      await updateCartItem(lineId, newQty);
    } catch {
      setOptimisticQty(null);
    }
  }, [lineId, displayQty, updateCartItem, isAdding]);

  const handleDecrement = useCallback(async () => {
    if (!lineId || isAdding) return;
    const newQty = displayQty - 1;
    if (newQty <= 0) {
      setOptimisticQty(0);
      try {
        await removeFromCart(lineId);
      } catch {
        setOptimisticQty(null);
      }
    } else {
      setOptimisticQty(newQty);
      try {
        await updateCartItem(lineId, newQty);
      } catch {
        setOptimisticQty(null);
      }
    }
  }, [lineId, displayQty, updateCartItem, removeFromCart, isAdding]);

  const imageUrl = getProductImageUrl(product, 0, true);

  return (
    <div className="flex-shrink-0 w-[120px] snap-start">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="120px"
            className="object-cover"
            loading="lazy"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[10px] font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-1.5 text-center">
          <h4 className="text-[11px] font-medium text-gray-900 line-clamp-1 leading-tight">
            {product.title}
          </h4>
          <p className="text-xs font-bold text-gray-900 mt-0.5">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          {isAvailable && displayQty === 0 && (
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="mx-auto mt-1 w-7 h-7 rounded-full bg-yellow-500 hover:bg-brand-yellow text-gray-900 flex items-center justify-center shadow-sm transition-all disabled:opacity-50"
              aria-label={`Add ${product.title} to cart`}
            >
              {isAdding ? (
                <div className="w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}
          {isAvailable && displayQty > 0 && (
            <div className="flex justify-center mt-1">
              <QuantityStepper
                quantity={displayQty}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                size="xs"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCompactCard(): ReactElement {
  return (
    <div className="flex-shrink-0 w-[120px]">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-1.5 space-y-1">
          <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default function DontForgetRow(): ReactElement | null {
  const { products, loading } = useQuickOrderProducts(BOAT_ESSENTIALS_HANDLE);

  if (!loading && products.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-900 tracking-wide uppercase mb-3">
          Don&apos;t Forget!
        </h3>
        <div
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCompactCard key={i} />)
            : products.map((product) => (
                <CompactCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </div>
  );
}
