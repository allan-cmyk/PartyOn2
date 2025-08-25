'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import CartItem from '../shopify/CartItem';
import { formatPrice } from '@/lib/shopify/utils';
import DeliveryScheduler from '@/components/DeliveryScheduler';

export default function MobileCart() {
  const { cart, isCartOpen, closeCart, loading } = useCartContext();
  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);
  const [cartHeight, setCartHeight] = useState('auto');
  const controls = useAnimation();
  const constraintsRef = useRef(null);
  
  const subtotal = cart?.cost.subtotalAmount;
  const total = cart?.cost.totalAmount;
  const hasItems = (cart?.totalQuantity || 0) > 0;

  // Calculate drawer height based on content
  useEffect(() => {
    if (isCartOpen) {
      const windowHeight = window.innerHeight;
      const maxHeight = windowHeight * 0.9; // 90% of screen height
      setCartHeight(`${maxHeight}px`);
    }
  }, [isCartOpen]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.offset.y > 100 || info.velocity.y > 500;
    
    if (shouldClose) {
      closeCart();
    } else {
      controls.start({ y: 0 });
    }
  };

  const handleProceedToCheckout = () => {
    setShowDeliveryScheduler(true);
  };

  const handleDeliveryConfirm = async () => {
    if (cart?.checkoutUrl) {
      const checkoutUrl = new URL(cart.checkoutUrl);
      checkoutUrl.searchParams.set('return_to', `${window.location.origin}/checkout/success`);
      window.location.href = checkoutUrl.toString();
    }
    setShowDeliveryScheduler(false);
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
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ maxHeight: cartHeight }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[70] md:hidden overflow-hidden safe-area-bottom"
            >
              {/* Drag Handle */}
              <div className="sticky top-0 bg-white z-10 pb-2">
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
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
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto px-5 pb-32">
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
                    {cart?.lines.edges.map(({ node }) => (
                      <CartItem key={node.id} item={node} />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Fixed at bottom */}
              {hasItems && (
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
                  <div className="px-5 py-4 space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-medium">
                        {subtotal && formatPrice(subtotal.amount, subtotal.currencyCode)}
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
                        Express delivery available (3 hours)
                      </p>
                    </div>

                    {/* Checkout Button */}
                    <button 
                      onClick={handleProceedToCheckout}
                      disabled={loading}
                      className="w-full py-4 bg-gold-600 text-white rounded-lg tracking-[0.1em] text-sm font-medium disabled:opacity-50"
                    >
                      CHECKOUT • {total && formatPrice(total.amount, total.currencyCode)}
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
        subtotal={subtotal ? parseFloat(subtotal.amount) : 0}
      />
    </>
  );
}