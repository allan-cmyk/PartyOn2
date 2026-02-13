/**
 * @fileoverview Welcome Package card component for Premier Party Cruises
 * @module components/partners/WelcomePackageCard
 */

'use client';

import { useState, useCallback, useEffect, type ReactElement } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant } from '@/lib/utils';
import { useCartContext } from '@/contexts/CartContext';

interface WelcomePackageCardProps {
  product: Product;
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
 * Displays package contents, price crossed out, and prominent add-to-cart.
 * Clicking the card opens a detail modal with full image & description.
 */
export default function WelcomePackageCard({
  product,
}: WelcomePackageCardProps): ReactElement {
  const { addToCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const variant = getFirstAvailableVariant(product);
  const variantId = variant?.id ?? product.variants.edges[0]?.node.id;
  const price = variant?.price ?? product.variants.edges[0]?.node.price;
  const isAvailable = variant?.availableForSale ?? true;

  const handleAdd = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isModalOpen]);

  const addToCartButton = (
    <>
      {isAvailable && (
        <button
          onClick={handleAdd}
          disabled={isAdding || isAdded}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm tracking-wide transition-all ${
            isAdded
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-yellow-500 hover:bg-brand-yellow text-gray-900'
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
    </>
  );

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all group cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-700 overflow-hidden">
          {/* FREE Badge */}
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-brand-yellow px-2.5 py-1 rounded-md shadow-lg">
            <span className="text-gray-900 font-bold text-xs tracking-wide">FREE</span>
          </div>
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
            <span className="text-brand-yellow font-bold text-sm ml-2">$0</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-heading text-lg text-white tracking-wide leading-tight">
            {packageName}
          </h3>

          <p className="text-gray-400 text-sm line-clamp-2">
            {descriptionText.slice(0, 100)}...
          </p>

          {addToCartButton}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gray-900 rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <div className="relative aspect-square bg-gray-800">
                {/* FREE Badge */}
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-500 to-brand-yellow px-3 py-1.5 rounded-md shadow-lg">
                  <span className="text-gray-900 font-bold text-sm tracking-wide">FREE</span>
                </div>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 512px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-xl md:text-2xl text-white leading-tight">
                    {packageName}
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gray-400 line-through text-base">
                      {formatPrice(price.amount, price.currencyCode)}
                    </span>
                    <span className="text-brand-yellow font-bold text-lg">$0</span>
                  </div>
                </div>

                {/* Full description */}
                {product.descriptionHtml ? (
                  <div
                    className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                      [&_h3]:text-white [&_h3]:font-heading [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1
                      [&_p]:mb-2 [&_li]:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <p className="text-gray-300 text-sm leading-relaxed">{descriptionText}</p>
                )}

                {/* Add to Cart */}
                <div className="pt-2">
                  {addToCartButton}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
