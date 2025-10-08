'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant, canPurchaseAlcohol } from '@/lib/shopify/utils';
import { useCartContext } from '@/contexts/CartContext';
import AgeVerificationModal from './AgeVerificationModal';

interface ProductModalProps {
  product: ShopifyProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, loading: cartLoading, openCart } = useCartContext();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  
  if (!product) return null;
  
  const variant = getFirstAvailableVariant(product);
  const price = product.priceRange.minVariantPrice;
  const images = product.images?.edges?.map(edge => edge.node) || [];
  const mainImage = images[selectedImageIndex] || { url: getProductImageUrl(product) || '', altText: product.title };

  const handleAddToCart = async () => {
    if (!variant?.id || !variant.availableForSale) return;
    
    // Check if user needs age verification for alcohol products
    if (!canPurchaseAlcohol()) {
      setShowAgeVerification(true);
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(variant.id, quantity);
      openCart(); // Open cart to show the newly added item
      setTimeout(() => {
        onClose(); // Close modal after cart opens
      }, 300);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAgeVerified = async () => {
    setShowAgeVerification(false);
    localStorage.setItem('age_verified', 'true');
    
    // Now add to cart
    if (variant?.id && variant.availableForSale) {
      setIsAdding(true);
      try {
        await addToCart(variant.id, quantity);
        openCart(); // Open cart to show the newly added item
        setTimeout(() => {
          onClose(); // Close modal after cart opens
        }, 300);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(99, quantity + delta));
    setQuantity(newQuantity);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white z-[9999] overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Image Section */}
              <div className="w-full md:w-1/2 lg:w-3/5 bg-gray-50 p-8 flex flex-col">
                {/* Main Image */}
                <div className="flex-1 flex items-center justify-center mb-4">
                  {mainImage.url ? (
                    <img
                      src={mainImage.url}
                      alt={mainImage.altText || product.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 border-2 transition-colors ${
                          selectedImageIndex === index ? 'border-gold-600' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.altText || `${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Details Section */}
              <div className="w-full md:w-1/2 lg:w-2/5 p-8 overflow-y-auto">
                {/* Vendor */}
                {product.vendor && (
                  <p className="text-xs text-gray-500 tracking-[0.15em] mb-2">
                    {product.vendor.toUpperCase()}
                  </p>
                )}
                
                {/* Title */}
                <h2 className="font-serif text-3xl text-gray-900 mb-4 tracking-[0.05em]">
                  {product.title}
                </h2>
                
                {/* Price */}
                <p className="font-light text-2xl text-gray-900 mb-6 tracking-[0.05em]">
                  {formatPrice(price.amount, price.currencyCode)}
                </p>
                
                {/* Description */}
                {product.description && (
                  <div className="prose prose-sm text-gray-600 mb-6">
                    <p>{product.description}</p>
                  </div>
                )}
                
                {/* Product Type */}
                {product.productType && (
                  <div className="mb-6">
                    <span className="text-xs text-gray-500 tracking-[0.1em]">TYPE</span>
                    <p className="text-sm text-gray-700 mt-1">{product.productType}</p>
                  </div>
                )}
                
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-xs text-gray-600 tracking-[0.1em] mb-2">QUANTITY</label>
                  <div className="flex items-center border border-gray-300 w-fit">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-6 py-2 text-sm font-medium text-gray-900 min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!variant?.availableForSale || isAdding || cartLoading}
                  className={`w-full py-3 transition-colors duration-300 text-sm tracking-[0.15em] ${
                    variant?.availableForSale && !isAdding && !cartLoading
                      ? 'bg-gold-600 text-white hover:bg-gold-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAdding || cartLoading 
                    ? 'ADDING...' 
                    : !variant?.availableForSale 
                      ? 'OUT OF STOCK' 
                      : quantity > 1 
                        ? `ADD ${quantity} TO CART`
                        : 'ADD TO CART'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeVerification}
        onClose={() => setShowAgeVerification(false)}
        onVerify={handleAgeVerified}
      />
    </>
  );
}