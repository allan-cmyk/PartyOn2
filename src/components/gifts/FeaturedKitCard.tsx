'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant, canPurchaseAlcohol } from '@/lib/shopify/utils';
import { useCartContext } from '@/contexts/CartContext';
import AgeVerificationModal from '../AgeVerificationModal';

interface FeaturedKitCardProps {
  product: ShopifyProduct;
  imagePosition?: 'left' | 'right';
  description?: string;
}

export default function FeaturedKitCard({
  product,
  imagePosition = 'left',
  description
}: FeaturedKitCardProps) {
  const { addToCart, loading: cartLoading } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const imageUrl = getProductImageUrl(product);
  const variant = getFirstAvailableVariant(product);
  const price = product.priceRange.minVariantPrice;

  const handleAddToCart = async () => {
    if (!variant?.id || !variant.availableForSale) return;

    if (!canPurchaseAlcohol()) {
      setShowAgeVerification(true);
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(variant.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAgeVerified = async () => {
    setShowAgeVerification(false);
    localStorage.setItem('age_verified', 'true');

    if (variant?.id && variant.availableForSale) {
      setIsAdding(true);
      try {
        await addToCart(variant.id, 1);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const productHandle = product.handle;
  const defaultDescription = product.description?.slice(0, 200) ||
    'Premium cocktail kit with everything you need to make delicious drinks at home.';

  return (
    <div className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${
      imagePosition === 'right' ? 'md:[direction:rtl]' : ''
    }`}>
      {/* Product Image */}
      <Link
        href={`/products/${productHandle}`}
        className="relative aspect-square overflow-hidden rounded-lg shadow-xl group md:[direction:ltr]"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-24 h-24 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      {/* Product Details */}
      <div className="md:[direction:ltr] space-y-6">
        <Link href={`/products/${productHandle}`}>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-neutral-900 tracking-wide hover:text-gold-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <p className="text-lg text-neutral-600 leading-relaxed">
          {description || defaultDescription}
        </p>

        <div className="text-3xl font-light text-neutral-900 tracking-wide">
          {formatPrice(price.amount, price.currencyCode)}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!variant?.availableForSale || isAdding || cartLoading}
            className={`px-8 py-4 text-sm tracking-[0.15em] font-medium transition-colors duration-300 ${
              variant?.availableForSale && !isAdding && !cartLoading
                ? 'bg-gold-500 text-white hover:bg-gold-600'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isAdding || cartLoading
              ? 'ADDING...'
              : !variant?.availableForSale
                ? 'OUT OF STOCK'
                : 'ADD TO CART'}
          </button>

          <Link
            href={`/products/${productHandle}`}
            className="px-8 py-4 border-2 border-gold-500 text-gold-600 hover:bg-gold-50 text-sm tracking-[0.15em] font-medium transition-colors duration-300 text-center"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeVerification}
        onClose={() => setShowAgeVerification(false)}
        onVerify={handleAgeVerified}
      />
    </div>
  );
}
