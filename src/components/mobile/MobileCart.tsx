'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import CartItem from '../shopify/CartItem';
import { formatPrice } from '@/lib/utils';
import { copyToClipboard, type SharedCartVariant } from '@/lib/cart/shareCart';
import { trackBeginCheckout } from '@/lib/analytics/track';

export default function MobileCart() {
  const router = useRouter();
  const { cart, isCartOpen, closeCart, loading, clearCart } = useCartContext();
  const [shareSuccess, setShareSuccess] = useState(false);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  const subtotal = cart?.cost?.subtotalAmount || null;
  const hasItems = (cart?.totalQuantity || 0) > 0;

  // Lock body scroll when cart is open
  useBodyScrollLock(isCartOpen);

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
    // Track begin checkout event
    if (cart && hasItems) {
      trackBeginCheckout(
        parseFloat(subtotal?.amount || '0'),
        cart.totalQuantity || 0
      );
    }
    // Go directly to checkout page
    closeCart();
    router.push('/checkout');
  };

  const handleShareCart = async () => {
    try {
      console.log('📤 Sharing cart...');
      console.log('📦 Current cart:', cart);

      setShareSuccess(false);

      const variants: SharedCartVariant[] = cart?.lines?.edges?.map(({ node }) => ({
        id: node.merchandise.id,
        quantity: node.quantity
      })) || [];

      console.log('📤 Variants to share:', variants);

      if (variants.length === 0) {
        throw new Error('No items to share');
      }

      // Call API to create shared cart
      const response = await fetch('/api/cart/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants })
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();

      if (!data.shareUrl) {
        throw new Error(data.error || 'Failed to create share link');
      }

      // Copy share URL to clipboard
      const copied = await copyToClipboard(data.shareUrl);

      if (copied) {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        alert(`Copy this link to share your cart:\n\n${data.shareUrl}`);
      }
    } catch (error) {
      console.error('Failed to share cart:', error);
      alert('Failed to create share link. Please try again.');
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
                  <div className="flex items-center gap-1">
                    {hasItems && (
                      <>
                        {/* Share Cart Button */}
                        <button
                          onClick={handleShareCart}
                          className="p-2 hover:bg-gold-50 transition-colors rounded-full text-gray-500 hover:text-gold-600"
                          aria-label="Share cart"
                          title={shareSuccess ? "Link copied!" : "Share cart"}
                        >
                          {shareSuccess ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          )}
                        </button>
                        {/* Clear Cart Button */}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to clear your cart?')) {
                              clearCart();
                            }
                          }}
                          className="p-2 hover:bg-red-50 transition-colors rounded-full text-gray-500 hover:text-red-600"
                          aria-label="Clear cart"
                          title="Clear cart"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
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
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                {!hasItems ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                      />
                    </svg>
                    <p className="text-gray-500 mb-6 text-center">Your cart is empty</p>
                    <Link href="/order" onClick={closeCart}>
                      <button className="px-6 py-3 bg-gold-600 text-gray-900 rounded-lg tracking-[0.1em] text-sm">
                        START ORDERING
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

                    {/* Checkout Button */}
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={loading}
                      className="w-full py-4 bg-gold-600 text-gray-900 rounded-lg tracking-[0.1em] text-sm font-medium disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {`CHECKOUT • ${subtotal && formatPrice(subtotal.amount, subtotal.currencyCode)}`}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}