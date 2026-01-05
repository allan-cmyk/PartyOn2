'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/shopify/utils';
import SimpleDeliveryScheduler from '@/components/SimpleDeliveryScheduler';
import AIConcierge from '@/components/AIConcierge';
import { copyToClipboard, type SharedCartVariant } from '@/lib/cart/shareCart';
import { parseAddress, formatPhone } from '@/lib/utils/addressParser';
import { trackBeginCheckout, trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/track';
// Group order imports temporarily disabled
// import { useGroupOrderContext } from '@/contexts/GroupOrderContext';
// import CreateGroupOrderModal from '@/components/group-orders/CreateGroupOrderModal';
// import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder';
// Discount imports temporarily disabled - handled at Shopify checkout
// import { shopifyFetch } from '@/lib/shopify/client';
// import { CART_DISCOUNT_CODES_UPDATE_MUTATION } from '@/lib/shopify/mutations/discount';

export default function Cart() {
  const { cart, isCartOpen, closeCart, loading, updateCartAttributes, clearCart } = useCartContext();
  // Group order features temporarily disabled
  // const { currentGroupOrder, isInGroupOrder, isHost } = useGroupOrderContext();
  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  // Group order states temporarily disabled
  // const [showCreateGroupOrder, setShowCreateGroupOrder] = useState(false);
  // const [showShareModal, setShowShareModal] = useState(false);
  // const [newGroupOrderCode, setNewGroupOrderCode] = useState('');
  // Discount states temporarily disabled - handled at Shopify checkout
  // const [discountCode, setDiscountCode] = useState('');
  // const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  // const [discountError, setDiscountError] = useState('');

  const subtotal = cart?.cost?.subtotalAmount || null;
  const hasItems = (cart?.totalQuantity || 0) > 0;

  const handleProceedToCheckout = () => {
    // Track begin checkout event
    if (cart && hasItems) {
      trackBeginCheckout(
        parseFloat(subtotal?.amount || '0'),
        cart.totalQuantity || 0
      );
    }
    // Show delivery scheduler to collect delivery information first
    setShowDeliveryScheduler(true);
  };

  const handleDeliveryConfirm = async (date: Date, time: string, instructions: string, address: string, zipCode: string, phone: string) => {
    try {
      // Set redirecting state to show loading
      setIsRedirecting(true);

      // Track delivery details set event
      trackEvent(ANALYTICS_EVENTS.SET_DELIVERY_DETAILS, {
        delivery_date: date.toISOString().split('T')[0],
        delivery_time: time,
        zip_code: zipCode
      });

      // Format date for better display in Shopify
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);

      // Parse address into components for Shop Pay
      let parsedAddress;
      try {
        parsedAddress = parseAddress(address, zipCode);
        console.log('Parsed address:', parsedAddress);
      } catch (parseError) {
        console.error('Error parsing address:', parseError);
        throw new Error('Invalid address format. Please check your address and try again.');
      }

      // Format phone number
      const formattedPhone = formatPhone(phone);

      // Create formatted note for order (visible in confirmation emails)
      const orderNote = `DELIVERY SCHEDULED:\nDate: ${formattedDate}\nTime: ${time}\nAddress: ${address}, ${parsedAddress.city}, ${parsedAddress.province} ${parsedAddress.zip}\nPhone: ${formattedPhone}${instructions ? `\nSpecial Instructions: ${instructions}` : ''}`;

      // Store delivery info in cart attributes (for backup/internal use) and note (for customer visibility)
      const attributes = [
        { key: 'note', value: orderNote }, // This shows in confirmation emails
        { key: 'delivery_date', value: formattedDate },
        { key: 'delivery_time', value: time },
        { key: 'delivery_address', value: address },
        { key: 'delivery_zip', value: zipCode },
        { key: 'delivery_phone', value: formattedPhone },
        { key: 'delivery_instructions', value: instructions || 'None' },
        { key: 'delivery_fee', value: '25.00' }
      ];

      console.log('Sending delivery attributes to Shopify:', attributes);

      // Try to update cart attributes, but proceed even if it fails
      let checkoutUrl = cart?.checkoutUrl;

      if (updateCartAttributes) {
        try {
          const updatedCart = await updateCartAttributes(attributes);
          console.log('Updated cart response:', updatedCart);
          console.log('Cart attributes after update:', updatedCart?.attributes);

          // Use the updated cart's checkout URL if available
          if (updatedCart?.checkoutUrl) {
            checkoutUrl = updatedCart.checkoutUrl;
          }
        } catch (attrError) {
          console.error('Error updating cart attributes, proceeding anyway:', attrError);
          // Continue with redirect even if attributes fail
        }
      }

      if (checkoutUrl) {
        // Build URL with Shop Pay parameters
        console.log('Building checkout URL with address parameters');

        try {
          const url = new URL(checkoutUrl);

          // Add Shop Pay address parameters (OFFICIAL Shopify method)
          url.searchParams.append('checkout[shipping_address][address1]', parsedAddress.address1);
          if (parsedAddress.address2) {
            url.searchParams.append('checkout[shipping_address][address2]', parsedAddress.address2);
          }
          url.searchParams.append('checkout[shipping_address][city]', parsedAddress.city);
          url.searchParams.append('checkout[shipping_address][province]', parsedAddress.province);
          url.searchParams.append('checkout[shipping_address][country]', parsedAddress.country);
          url.searchParams.append('checkout[shipping_address][zip]', parsedAddress.zip);
          url.searchParams.append('checkout[shipping_address][phone]', formattedPhone);

          checkoutUrl = url.toString();
          console.log('Final checkout URL with Shop Pay parameters:', checkoutUrl);
        } catch (urlError) {
          console.error('Error building URL parameters:', urlError);
        }

        // Longer delay for mobile devices
        const delay = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 500 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Try multiple redirect methods for better compatibility
        try {
          // Method 1: Direct assignment (most compatible)
          window.location.href = checkoutUrl;
        } catch {
          try {
            // Method 2: Replace (prevents back button)
            window.location.replace(checkoutUrl);
          } catch {
            // Method 3: Create a link and click it
            const link = document.createElement('a');
            link.href = checkoutUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }

        // Keep loading state active to prevent any further interactions
        // Don't reset states here as the page is redirecting
        return;
      } else {
        throw new Error('No checkout URL available');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      // If there's an error, reset states so user can try again
      setIsRedirecting(false);
      setShowDeliveryScheduler(false);

      // More helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Unable to proceed to checkout: ${errorMessage}. Please try again or contact support if the issue persists.`);
    }
  };

  const handleShareCart = async () => {
    if (!cart || !hasItems) return;

    try {
      setIsSharing(true);
      setShareSuccess(false);

      // Extract cart items for sharing
      const variants: SharedCartVariant[] = cart.lines?.edges?.map(({ node }) => ({
        id: node.merchandise.id,
        quantity: node.quantity,
      })) || [];

      console.clear();
      console.log('🛒 ===== SHARE CART DEBUG =====');
      console.log('📊 Total cart lines:', cart.lines?.edges?.length || 0);
      console.log('📦 Extracted variants:', variants.length);
      console.log('🔍 Cart data:', cart.lines?.edges?.map(({ node }) => ({
        id: node.merchandise.id,
        quantity: node.quantity,
        title: node.merchandise.product?.title
      })));
      console.log('📤 Variants to share:', variants);
      console.log('🛒 ===========================');

      if (variants.length === 0) {
        throw new Error('No items to share');
      }

      // Call API to create shared cart
      const response = await fetch('/api/cart/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variants }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create share link');
      }

      // Copy share URL to clipboard
      const copied = await copyToClipboard(data.shareUrl);

      if (copied) {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // Fallback: show the URL for manual copying
        alert(`Copy this link to share your cart:\n\n${data.shareUrl}`);
      }

    } catch (error) {
      console.error('Error sharing cart:', error);
      alert('Failed to create share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Group order handler temporarily disabled
  // const handleGroupOrderSuccess = (shareCode: string) => {
  //   setNewGroupOrderCode(shareCode);
  //   setShowCreateGroupOrder(false);
  //   setShowShareModal(true);
  // };

  // Discount functions temporarily disabled - handled at Shopify checkout
  // const handleApplyDiscount = async () => { ... };
  // const handleRemoveDiscount = async (code: string) => { ... };

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
                <div className="flex items-center gap-2">
                  {hasItems && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your cart?')) {
                          clearCart();
                        }
                      }}
                      className="p-2 hover:bg-red-50 transition-colors rounded-full text-gray-600 hover:text-red-600"
                      aria-label="Clear cart"
                      title="Clear cart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
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
              </div>

              {/* Cart Contents */}
              <div className="flex-1 overflow-y-auto">
                {!hasItems ? (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-500 mb-6 text-center">Your cart is empty</p>
                    <Link href="/order" onClick={closeCart}>
                      <button className="px-6 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                        START ORDERING
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {cart?.lines?.edges?.map(({ node }) => (
                      <CartItem key={node.id} item={node} />
                    )) || []}
                  </div>
                )}
              </div>

              {/* Footer */}
              {hasItems && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  {/* Group Order Info - Hidden until Stripe setup */}
                  {/* {isInGroupOrder && currentGroupOrder && (
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm tracking-[0.1em] text-gray-600">GROUP ORDER</span>
                        <span className="text-sm font-cormorant text-gold-500">{currentGroupOrder.shareCode}</span>
                      </div>
                      <p className="text-sm font-cormorant">{currentGroupOrder.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Delivery: {new Date(currentGroupOrder.deliveryDate).toLocaleDateString()} at {currentGroupOrder.deliveryTime}
                      </p>
                      {isHost && (
                        <Link href="/group/dashboard" onClick={closeCart}>
                          <button className="mt-2 text-xs text-gold-600 hover:text-gold-700 underline">
                            View Dashboard →
                          </button>
                        </Link>
                      )}
                    </div>
                  )} */}

                  {/* Discount Code Notice */}
                  <div className="bg-gray-50 px-4 py-3 rounded">
                    <p className="text-sm text-gray-600 text-center">
                      <svg className="inline-block w-4 h-4 mr-1.5 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Discount codes can be applied at Shopify checkout
                    </p>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {subtotal ? formatPrice(subtotal.amount, subtotal.currencyCode) : '$0.00'}
                    </span>
                  </div>

                  {/* Discount Amount - Hidden, discounts applied at Shopify checkout */}
                  {/* {cart?.discountCodes && cart.discountCodes.length > 0 && cart.discountCodes.some(d => d.applicable) && (
                    (() => {
                      const discountAmount = subtotal && total ? 
                        parseFloat(subtotal.amount) - parseFloat(total.amount) : 0;
                      
                      if (discountAmount > 0) {
                        return (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>
                              Discount ({cart.discountCodes.filter(d => d.applicable).map(d => d.code).join(', ')})
                            </span>
                            <span>-{subtotal && formatPrice(discountAmount.toFixed(2), subtotal.currencyCode)}</span>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )} */}

                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-gray-500 text-xs">Calculated at checkout</span>
                  </div>

                  {/* Total - Show subtotal since delivery is calculated at checkout */}
                  <div className="flex justify-between font-medium text-lg pt-4 border-t border-gray-200">
                    <span className="font-serif tracking-[0.1em]">SUBTOTAL</span>
                    <span>
                      {subtotal ? formatPrice(subtotal.amount, subtotal.currencyCode) : '$0.00'}
                    </span>
                  </div>

                  {/* Notice */}
                  <div className="bg-gray-50 p-4 text-sm text-gray-600">
                    <p className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      ID verification required upon delivery
                    </p>
                  </div>

                  {/* Group Order Button - Hidden until Stripe setup */}
                  {/* {!isInGroupOrder && (
                    <button 
                      onClick={() => setShowCreateGroupOrder(true)}
                      disabled={loading}
                      className="w-full py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all tracking-[0.15em] text-sm disabled:opacity-50"
                    >
                      START GROUP ORDER
                    </button>
                  )} */}

                  {/* Checkout Button */}
                  <button 
                    onClick={handleProceedToCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gold-500 text-gray-900 hover:bg-gold-600 transition-colors tracking-[0.15em] text-sm disabled:opacity-50"
                  >
                    PROCEED TO CHECKOUT
                  </button>

                  {/* Share Cart Button */}
                  <button
                    onClick={handleShareCart}
                    disabled={isSharing || !hasItems}
                    className="w-full py-3 border border-gray-300 text-gray-700 hover:border-gold-600 hover:text-gold-700 transition-colors tracking-[0.1em] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSharing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        <span>CREATING LINK...</span>
                      </>
                    ) : shareSuccess ? (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-600">LINK COPIED!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span>SHARE CART</span>
                      </>
                    )}
                  </button>

                  {/* Continue Shopping */}
                  <Link href="/order" onClick={closeCart}>
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

      {/* Simple Delivery Scheduler */}
      <SimpleDeliveryScheduler
        isOpen={showDeliveryScheduler}
        onClose={() => {
          // Don't allow closing during redirect
          if (!isRedirecting) {
            setShowDeliveryScheduler(false);
          }
        }}
        onConfirm={handleDeliveryConfirm}
      />
      
      {/* AI Concierge - only show when cart is open */}
      {isCartOpen && <AIConcierge mode="party" />}
      
      {/* Loading overlay during redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center pointer-events-auto">
          <div className="bg-white p-8 rounded-lg shadow-2xl">
            <div className="animate-spin h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 text-center font-medium">Redirecting to checkout...</p>
            <p className="text-gray-500 text-sm text-center mt-2">Please wait</p>
          </div>
        </div>
      )}
      
      {/* Group Order Modals - Temporarily disabled */}
      {/* <CreateGroupOrderModal
        isOpen={showCreateGroupOrder}
        onClose={() => setShowCreateGroupOrder(false)}
        onSuccess={handleGroupOrderSuccess}
      /> */}
      
      {/* {showShareModal && (
        <ShareGroupOrder
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareCode={newGroupOrderCode}
          eventName={currentGroupOrder?.name || 'Group Order'}
        />
      )} */}
    </>
  );
}