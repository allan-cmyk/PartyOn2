/**
 * @fileoverview Simplified product card for Quick Order page
 * @module components/quick-order/QuickProductCard
 */

'use client';

import { useState, useCallback, useEffect, type ReactElement } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant } from '@/lib/utils';
import { useCartContext } from '@/contexts/CartContext';
import QuantityStepper from './QuantityStepper';

interface QuickProductCardProps {
  product: Product;
  /** Callback when product image is clicked to open detail modal */
  onImageClick?: (product: Product) => void;
}

/**
 * Extract pack size from variant title
 */
function getPackSize(product: Product): string {
  const variant = product.variants.edges[0]?.node;
  const title = variant?.title;
  if (title && title !== 'Default Title') {
    return title;
  }
  return '';
}

/**
 * Simplified product card with quick add functionality
 *
 * Shows green "+" button initially, expands to quantity stepper after first add.
 * Uses optimistic updates for instant feedback.
 */
export default function QuickProductCard({
  product,
  onImageClick,
}: QuickProductCardProps): ReactElement {
  const { cart, addToCart, updateCartItem, removeFromCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [optimisticQty, setOptimisticQty] = useState<number | null>(null);

  const variant = getFirstAvailableVariant(product);
  const variantId = variant?.id ?? product.variants.edges[0]?.node.id;
  const price = variant?.price ?? product.variants.edges[0]?.node.price;
  const isAvailable = variant?.availableForSale ?? false;

  // Find this product in cart
  const cartLine = cart?.lines?.edges?.find(
    (e) => e.node.merchandise.id === variantId
  )?.node;
  const cartQuantity = cartLine?.quantity ?? 0;
  const lineId = cartLine?.id;


  // Clear optimistic qty once cart state catches up
  useEffect(() => {
    if (optimisticQty !== null && cartQuantity === optimisticQty) {
      setOptimisticQty(null);
    }
  }, [cartQuantity, optimisticQty]);

  // Display quantity (optimistic or actual)
  const displayQty = optimisticQty ?? cartQuantity;

  const handleAdd = useCallback(async () => {
    if (!variantId || isAdding) return;

    setIsAdding(true);
    setOptimisticQty(1);
    try {
      await addToCart(variantId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
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
    } catch (error) {
      console.error('Failed to update cart:', error);
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
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        setOptimisticQty(null);
      }
    } else {
      setOptimisticQty(newQty);
      try {
        await updateCartItem(lineId, newQty);
      } catch (error) {
        console.error('Failed to update cart:', error);
        setOptimisticQty(null);
      }
    }
  }, [lineId, displayQty, updateCartItem, removeFromCart, isAdding]);

  const packSize = getPackSize(product);
  const imageUrl = getProductImageUrl(product, 0, true);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image - Clickable to open modal */}
      <button
        type="button"
        onClick={() => onImageClick?.(product)}
        className="relative aspect-square bg-gray-100 w-full cursor-pointer group"
        aria-label={`View details for ${product.title}`}
      >
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover overlay with "View" indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/60 px-2 py-1 rounded">
            TAP TO VIEW
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium text-sm">Out of Stock</span>
          </div>
        )}
      </button>

      {/* Product Info */}
      <div className="p-2 space-y-0.5 text-center">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
          {product.title}
        </h3>
        {packSize && (
          <p className="text-sm text-gray-500">{packSize}</p>
        )}
        <p className="font-bold text-base sm:text-lg text-gray-900">
          {formatPrice(price.amount, price.currencyCode)}
        </p>

        {/* Add Button / Quantity Stepper - centered below product info */}
        {isAvailable && displayQty === 0 && (
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="mx-auto mt-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500 hover:bg-brand-yellow text-gray-900 flex items-center justify-center shadow-md transition-all disabled:opacity-50"
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdding ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}

        {isAvailable && displayQty > 0 && (
          <div className="flex justify-center mt-1.5">
            <QuantityStepper
              quantity={displayQty}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              size="xs"
            />
          </div>
        )}

        {!isAvailable && (
          <p className="text-sm text-gray-400 mt-1.5">Unavailable</p>
        )}
      </div>
    </div>
  );
}
