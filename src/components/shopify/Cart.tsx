'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/shopify/utils';
import DeliveryScheduler from '@/components/DeliveryScheduler';
import AIConcierge from '@/components/AIConcierge';
import { useGroupOrderContext } from '@/contexts/GroupOrderContext';
import CreateGroupOrderModal from '@/components/group-orders/CreateGroupOrderModal';
import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder';

export default function Cart() {
  const { cart, isCartOpen, closeCart, loading, updateCartAttributes } = useCartContext();
  const { currentGroupOrder, isInGroupOrder } = useGroupOrderContext();
  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);
  const [showCreateGroupOrder, setShowCreateGroupOrder] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newGroupOrderCode, setNewGroupOrderCode] = useState('');

  const subtotal = cart?.cost.subtotalAmount;
  const total = cart?.cost.totalAmount;
  const hasItems = (cart?.totalQuantity || 0) > 0;

  const handleProceedToCheckout = () => {
    setShowDeliveryScheduler(true);
  };

  const handleDeliveryConfirm = async (date: Date, time: string, instructions: string, isExpress?: boolean) => {
    // Store delivery info in cart attributes
    const attributes = [
      { key: 'delivery_date', value: date.toISOString() },
      { key: 'delivery_time', value: time },
      { key: 'delivery_instructions', value: instructions },
      { key: 'express_delivery', value: isExpress ? 'true' : 'false' },
      { key: 'delivery_fee', value: isExpress ? '0.00' : '15.00' }
    ];

    if (updateCartAttributes) {
      await updateCartAttributes(attributes);
    }

    // Redirect to Shopify checkout with return URL
    if (cart?.checkoutUrl) {
      // Add return URL to checkout
      const checkoutUrl = new URL(cart.checkoutUrl);
      checkoutUrl.searchParams.set('return_to', `${window.location.origin}/checkout/success`);
      window.location.href = checkoutUrl.toString();
    }
    
    setShowDeliveryScheduler(false);
  };

  const handleGroupOrderSuccess = (shareCode: string) => {
    setNewGroupOrderCode(shareCode);
    setShowCreateGroupOrder(false);
    setShowShareModal(true);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[70]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="font-serif text-2xl text-gray-900 tracking-[0.1em]">
                  YOUR CART
                </h2>
                <button
                  onClick={closeCart}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-full"
                  aria-label="Close cart"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Contents */}
              <div className="flex-1 overflow-y-auto">
                {!hasItems ? (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-500 mb-6 text-center">Your cart is empty</p>
                    <Link href="/products" onClick={closeCart}>
                      <button className="px-6 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                        SHOP PRODUCTS
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {cart?.lines.edges.map(({ node }) => (
                      <CartItem key={node.id} item={node} />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {hasItems && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  {/* Group Order Info */}
                  {isInGroupOrder && currentGroupOrder && (
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm tracking-[0.1em] text-gray-600">GROUP ORDER</span>
                        <span className="text-sm font-cormorant text-gold-500">{currentGroupOrder.shareCode}</span>
                      </div>
                      <p className="text-sm font-cormorant">{currentGroupOrder.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Delivery: {new Date(currentGroupOrder.deliveryDate).toLocaleDateString()} at {currentGroupOrder.deliveryTime}
                      </p>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {subtotal && formatPrice(subtotal.amount, subtotal.currencyCode)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-gray-500 text-xs">Calculated at checkout</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between font-medium text-lg pt-4 border-t border-gray-200">
                    <span className="font-serif tracking-[0.1em]">TOTAL</span>
                    <span>
                      {total && formatPrice(total.amount, total.currencyCode)}
                    </span>
                  </div>

                  {/* Notice */}
                  <div className="bg-gray-50 p-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <p className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong>Express:</strong> 3-hour delivery available on orders $50+
                        </span>
                      </p>
                      <p className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        ID verification required upon delivery
                      </p>
                    </div>
                  </div>

                  {/* Group Order Button - Only show if not already in a group order */}
                  {!isInGroupOrder && (
                    <button 
                      onClick={() => setShowCreateGroupOrder(true)}
                      disabled={loading}
                      className="w-full py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all tracking-[0.15em] text-sm disabled:opacity-50"
                    >
                      START GROUP ORDER
                    </button>
                  )}

                  {/* Checkout Button */}
                  <button 
                    onClick={handleProceedToCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em] text-sm disabled:opacity-50"
                  >
                    PROCEED TO CHECKOUT
                  </button>

                  {/* Continue Shopping */}
                  <Link href="/products" onClick={closeCart}>
                    <button className="w-full py-3 border border-gray-300 text-gray-700 hover:border-gold-600 transition-colors tracking-[0.1em] text-sm">
                      CONTINUE SHOPPING
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery Scheduler */}
      <DeliveryScheduler
        isOpen={showDeliveryScheduler}
        onClose={() => setShowDeliveryScheduler(false)}
        onConfirm={handleDeliveryConfirm}
        subtotal={subtotal ? parseFloat(subtotal.amount) : 0}
      />
      
      {/* AI Concierge - only show when cart is open */}
      {isCartOpen && <AIConcierge mode="party" />}
      
      {/* Group Order Modals */}
      <CreateGroupOrderModal
        isOpen={showCreateGroupOrder}
        onClose={() => setShowCreateGroupOrder(false)}
        onSuccess={handleGroupOrderSuccess}
      />
      
      {showShareModal && (
        <ShareGroupOrder
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareCode={newGroupOrderCode}
          eventName={currentGroupOrder?.name || 'Group Order'}
        />
      )}
    </>
  );
}