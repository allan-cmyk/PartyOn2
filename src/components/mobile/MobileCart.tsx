'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import CartItem from '../shopify/CartItem';
import { formatPrice } from '@/lib/shopify/utils';
import { parseAddress, formatPhone } from '@/lib/utils/addressParser';
import DeliveryScheduler from '@/components/DeliveryScheduler';

export default function MobileCart() {
  const { cart, isCartOpen, closeCart, loading, updateCartAttributes } = useCartContext();
  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);
  
  const subtotal = cart?.cost?.subtotalAmount || null;
  const hasItems = (cart?.totalQuantity || 0) > 0;

  // Calculate drawer height based on content
  useEffect(() => {
    if (isCartOpen) {
      controls.start({ y: 0 });
    }
  }, [isCartOpen, controls]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // More responsive drag threshold for mobile
    const shouldClose = info.offset.y > 50 || (info.velocity.y > 0 && info.velocity.y > 300);
    
    if (shouldClose) {
      closeCart();
    } else {
      controls.start({ y: 0, transition: { type: 'spring', damping: 25, stiffness: 500 } });
    }
  };

  const handleProceedToCheckout = () => {
    setShowDeliveryScheduler(true);
  };

  const handleDeliveryConfirm = async (date: Date, time: string, instructions: string, phone: string, address: string, zipCode: string) => {
    try {
      setIsRedirecting(true);
      
      // Format date for Shopify
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Parse the address for Shop Pay
      const parsedAddress = parseAddress(address, zipCode);
      const formattedPhone = formatPhone(phone);
      
      // Store delivery info in cart attributes (for backup/internal use)
      const attributes = [
        { key: 'delivery_date', value: formattedDate },
        { key: 'delivery_time', value: time },
        { key: 'delivery_instructions', value: instructions || 'None' },
        { key: 'delivery_phone', value: phone },
        { key: 'delivery_address', value: address },
        { key: 'delivery_zip', value: zipCode },
        { key: 'delivery_fee', value: '25.00' }
      ];

      // Update cart with delivery attributes
      if (updateCartAttributes) {
        const updatedCart = await updateCartAttributes(attributes);
        
        // Redirect to checkout with updated cart and Shop Pay parameters
        if (updatedCart?.checkoutUrl) {
          // Build checkout URL with address parameters for Shop Pay
          const checkoutUrl = new URL(updatedCart.checkoutUrl);
          
          // Add Shop Pay payment method hint
          checkoutUrl.searchParams.append('payment', 'shop_pay');
          
          // Add shipping address parameters
          checkoutUrl.searchParams.append('checkout[shipping_address][address1]', parsedAddress.address1);
          if (parsedAddress.address2) {
            checkoutUrl.searchParams.append('checkout[shipping_address][address2]', parsedAddress.address2);
          }
          checkoutUrl.searchParams.append('checkout[shipping_address][city]', parsedAddress.city);
          checkoutUrl.searchParams.append('checkout[shipping_address][province]', parsedAddress.province);
          checkoutUrl.searchParams.append('checkout[shipping_address][country]', parsedAddress.country);
          checkoutUrl.searchParams.append('checkout[shipping_address][zip]', parsedAddress.zip);
          checkoutUrl.searchParams.append('checkout[shipping_address][phone]', formattedPhone);
          
          // Use location.replace for cleaner mobile redirect
          window.location.replace(checkoutUrl.toString());
        }
      } else if (cart?.checkoutUrl) {
        // Fallback to direct checkout with parameters
        const checkoutUrl = new URL(cart.checkoutUrl);
        
        // Add Shop Pay payment method hint
        checkoutUrl.searchParams.append('payment', 'shop_pay');
        
        // Add shipping address parameters
        checkoutUrl.searchParams.append('checkout[shipping_address][address1]', parsedAddress.address1);
        if (parsedAddress.address2) {
          checkoutUrl.searchParams.append('checkout[shipping_address][address2]', parsedAddress.address2);
        }
        checkoutUrl.searchParams.append('checkout[shipping_address][city]', parsedAddress.city);
        checkoutUrl.searchParams.append('checkout[shipping_address][province]', parsedAddress.province);
        checkoutUrl.searchParams.append('checkout[shipping_address][country]', parsedAddress.country);
        checkoutUrl.searchParams.append('checkout[shipping_address][zip]', parsedAddress.zip);
        checkoutUrl.searchParams.append('checkout[shipping_address][phone]', formattedPhone);
        
        window.location.replace(checkoutUrl.toString());
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setShowDeliveryScheduler(false);
      setIsRedirecting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              onClick={closeCart}
            />

            {/* Bottom Sheet Cart */}
            <motion.div
              ref={constraintsRef}
              initial={{ y: '100%' }}
              animate={controls}
              exit={{ y: '100%' }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 400,
                mass: 0.8
              }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={handleDragEnd}
              dragListener={false}
              className="fixed inset-x-0 bottom-0 h-[90vh] bg-white rounded-t-3xl shadow-2xl z-[70] md:hidden flex flex-col safe-area-bottom"
            >
              {/* Drag Handle */}
              <div 
                className="sticky top-0 bg-white z-10 pb-2"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="flex justify-center py-5 cursor-grab active:cursor-grabbing touch-none">
                  <div className="w-24 h-2.5 bg-gray-400 rounded-full" />
                </div>
              </div>
                
              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
                  <h2 className="font-serif text-xl tracking-[0.1em]">YOUR CART</h2>
                  <button
                    onClick={closeCart}
                    className="p-2 -mr-2 text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                {!hasItems ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                      />
                    </svg>
                    <p className="text-gray-500 mb-6 text-center">Your cart is empty</p>
                    <Link href="/products" onClick={closeCart}>
                      <button className="px-6 py-3 bg-gold-600 text-white rounded-lg tracking-[0.1em] text-sm">
                        SHOP PRODUCTS
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {cart?.lines?.edges?.map(({ node }) => (
                      <CartItem key={node.id} item={node} />
                    )) || []}
                  </div>
                )}
              </div>

              {/* Footer - Fixed at bottom */}
              {hasItems && (
                <div className="bg-white border-t border-gray-200 safe-area-bottom mt-auto">
                  <div className="px-5 py-4 space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-medium">
                        {subtotal ? formatPrice(subtotal.amount, subtotal.currencyCode) : '$0.00'}
                      </span>
                    </div>

                    {/* Delivery Notice */}
                    <div className="bg-gold-50 p-3 rounded-lg">
                      <p className="text-xs text-gold-800 flex items-start">
                        <svg className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        Testing Mode: No delivery restrictions
                      </p>
                    </div>

                    {/* Checkout Button */}
                    <button 
                      onClick={handleProceedToCheckout}
                      disabled={loading || isRedirecting}
                      className="w-full py-4 bg-gold-600 text-white rounded-lg tracking-[0.1em] text-sm font-medium disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {isRedirecting ? 'REDIRECTING...' : `CHECKOUT • ${subtotal && formatPrice(subtotal.amount, subtotal.currencyCode)}`}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delivery Scheduler */}
      <DeliveryScheduler
        isOpen={showDeliveryScheduler}
        onClose={() => setShowDeliveryScheduler(false)}
        onConfirm={handleDeliveryConfirm}
      />

      {/* Loading Overlay for redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mb-4"></div>
            <p className="text-sm text-gray-600">Redirecting to checkout...</p>
          </div>
        </div>
      )}
    </>
  );
}