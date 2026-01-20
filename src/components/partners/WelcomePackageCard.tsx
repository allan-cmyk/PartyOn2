/**
 * @fileoverview Welcome Package card component for Premier Party Cruises
 * @module components/partners/WelcomePackageCard
 */

'use client';

import { useState, useCallback, type ReactElement } from 'react';
import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant } from '@/lib/shopify/utils';
import { useCartContext } from '@/contexts/CartContext';

interface WelcomePackageCardProps {
  product: ShopifyProduct;
  /** Discount code to display */
  discountCode?: string;
}

/**
 * Extract package name from full title
 * "Welcome to Austin: Keep Austin Weird Shots" -> "Keep Austin Weird Shots"
 */
function getPackageName(title: string): string {
  const colonIndex = title.indexOf(':');
  if (colonIndex !== -1) {
    return title.slice(colonIndex + 1).trim();
  }
  return title;
}

/**
 * Welcome Package card with "FREE with code" badge
 *
 * Displays package contents, price crossed out, and prominent add-to-cart
 */
export default function WelcomePackageCard({
  product,
  discountCode = 'PREMIERPARTYCRUISES',
}: WelcomePackageCardProps): ReactElement {
  const { addToCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const variant = getFirstAvailableVariant(product);
  const variantId = variant?.id ?? product.variants.edges[0]?.node.id;
  const price = variant?.price ?? product.variants.edges[0]?.node.price;
  const isAvailable = variant?.availableForSale ?? true;

  const handleAdd = useCallback(async () => {
    if (!variantId || isAdding || isAdded) return;
    setIsAdding(true);
    try {
      await addToCart(variantId, 1);
      setIsAdded(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  }, [variantId, addToCart, isAdding, isAdded]);

  const packageName = getPackageName(product.title);
  const imageUrl = getProductImageUrl(product, 0, false);

  // Extract description text without HTML
  const descriptionText = product.description?.replace(/<[^>]*>/g, '') || '';

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gold-500/50 transition-all group">
      {/* FREE Badge */}
      <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-3 py-1.5 text-center">
        <span className="text-gray-900 font-bold text-sm tracking-wide">
          FREE WITH CODE
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-700 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}

        {/* Price Badge (crossed out) */}
        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded">
          <span className="text-gray-400 line-through text-sm">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          <span className="text-gold-400 font-bold text-sm ml-2">$0</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-serif text-xl text-white tracking-wide">
          {packageName}
        </h3>

        <p className="text-gray-400 text-sm line-clamp-2">
          {descriptionText.slice(0, 100)}...
        </p>

        {/* Add to Cart Button */}
        {isAvailable && (
          <button
            onClick={handleAdd}
            disabled={isAdding || isAdded}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm tracking-wide transition-all ${
              isAdded
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-gold-500 hover:bg-gold-400 text-gray-900'
            }`}
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : isAdded ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added to Cart
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
        )}

        {!isAvailable && (
          <div className="w-full py-3 px-4 rounded-lg bg-gray-700 text-gray-400 text-center text-sm">
            Currently Unavailable
          </div>
        )}

        {/* Discount Code Reminder */}
        <p className="text-center text-xs text-gray-500">
          Use code{' '}
          <span className="font-mono text-gold-400">{discountCode}</span>{' '}
          at checkout
        </p>
      </div>
    </div>
  );
}
