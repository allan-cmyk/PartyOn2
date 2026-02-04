'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import DeliveryDateTimePicker from '@/components/checkout/DeliveryDateTimePicker';
import { useCartContext } from '@/contexts/CartContext';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { useGroupOrderContext } from '@/contexts/GroupOrderContext';
import CustomerAuth from '@/components/CustomerAuth';

export default function CheckoutPage() {
  const { cart, loading: cartLoading, isCustomCart } = useCartContext();
  const { customer, isAuthenticated } = useCustomerContext();
  const { isInGroupOrder, currentGroupOrder, isHost } = useGroupOrderContext();
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Delivery schedule state (inline picker)
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: 'Austin',
    state: 'TX',
    zip: '',
    country: 'US'
  });

  // const [applyLoyaltyPoints, setApplyLoyaltyPoints] = useState(false); // Disabled for now
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountFeedback, setDiscountFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Initialize form with customer data
  useEffect(() => {
    if (customer) {
      setBillingAddress(prev => ({
        ...prev,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || ''
      }));
    }
  }, [customer]);

  // Initialize delivery details from cart attributes (if already collected)
  useEffect(() => {
    if (cart?.attributes && !deliveryDate) {
      const getAttr = (key: string) => cart.attributes?.find((a: { key: string; value: string }) => a.key === key)?.value;

      const dateStr = getAttr('delivery_date');
      const time = getAttr('delivery_time');
      const instructions = getAttr('delivery_instructions');

      if (dateStr) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          setDeliveryDate(parsedDate);
        }
      }
      if (time) setDeliveryTime(time);
      if (instructions) setDeliveryInstructions(instructions);
    }
  }, [cart?.attributes, deliveryDate]);

  // Pre-fill ZIP code from cart attributes
  useEffect(() => {
    if (cart?.attributes) {
      const zipAttr = cart.attributes.find((a: { key: string; value: string }) => a.key === 'delivery_zip')?.value;
      if (zipAttr && !billingAddress.zip) {
        setBillingAddress(prev => ({ ...prev, zip: zipAttr }));
      }
    }
  }, [cart?.attributes, billingAddress.zip]);

  // Calculate totals - with proper null checks to prevent subtotalAmount error
  const subtotal = cart?.cost?.subtotalAmount ? parseFloat(cart.cost.subtotalAmount.amount) :
    (cart?.lines?.edges?.reduce((total, { node }) => {
      return total + (parseFloat(node.merchandise.price?.amount || '0') * (node.quantity || 0));
    }, 0) || 0);

  const deliveryFee = 25; // Standard delivery fee
  const tax = subtotal * 0.0825; // Texas sales tax

  // Get discount amount from cart
  // For custom cart, read from attributes where we stored it
  // For Shopify cart, calculate from the difference between subtotal and total
  const discountAmount = isCustomCart
    ? parseFloat(cart?.attributes?.find(a => a.key === '_discountAmount')?.value || '0')
    : (cart?.cost?.totalAmount && cart?.cost?.subtotalAmount
      ? parseFloat(cart.cost.subtotalAmount.amount) - parseFloat(cart.cost.totalAmount.amount) + deliveryFee + tax
      : 0);

  const total = subtotal + deliveryFee + tax - Math.abs(discountAmount);

  // Check if this is a group order checkout
  const isGroupCheckout = isInGroupOrder && isHost;

  const handleApplyDiscount = async () => {
    if (!cart || !discountCode.trim()) return;

    setIsApplyingDiscount(true);
    setDiscountFeedback({ type: null, message: '' });

    try {
      if (isCustomCart) {
        // Custom cart discount - call our API
        const response = await fetch('/api/v1/cart/discount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: discountCode.trim().toUpperCase() }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          setDiscountFeedback({
            type: 'error',
            message: data.error || 'Invalid or expired discount code'
          });
        } else {
          setDiscountFeedback({
            type: 'success',
            message: data.message || `Discount code "${discountCode.toUpperCase()}" applied!`
          });
          setDiscountCode('');
          // Refresh the page to show updated cart totals
          window.location.reload();
        }
      } else {
        // Shopify discount - dynamic import to avoid build errors when not using Shopify
        const { shopifyFetch } = await import('@/lib/shopify/client');
        const { CART_DISCOUNT_CODES_UPDATE_MUTATION } = await import('@/lib/shopify/mutations/discount');

        const response = await shopifyFetch({
          query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
          variables: {
            cartId: cart.id,
            discountCodes: [...(cart.discountCodes?.map(d => d.code) || []), discountCode.trim().toUpperCase()]
          }
        }) as {
          cartDiscountCodesUpdate?: {
            userErrors?: Array<{ field?: string; message?: string }>;
            cart?: unknown;
          };
        };

        if (response?.cartDiscountCodesUpdate?.userErrors?.length && response.cartDiscountCodesUpdate.userErrors.length > 0) {
          setDiscountFeedback({
            type: 'error',
            message: 'Invalid or expired discount code'
          });
        } else {
          setDiscountFeedback({
            type: 'success',
            message: `Discount code "${discountCode.toUpperCase()}" applied successfully!`
          });
          setDiscountCode('');
        }
      }
    } catch {
      setDiscountFeedback({
        type: 'error',
        message: 'Failed to apply discount code. Please try again.'
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = async (code: string) => {
    if (!cart) return;

    try {
      if (isCustomCart) {
        // Custom cart - call our API
        const response = await fetch('/api/v1/cart/discount', {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        }
        return;
      }

      // Shopify discount - dynamic import
      const { shopifyFetch } = await import('@/lib/shopify/client');
      const { CART_DISCOUNT_CODES_UPDATE_MUTATION } = await import('@/lib/shopify/mutations/discount');

      const currentCodes = cart.discountCodes?.filter(d => d.code !== code).map(d => d.code) || [];

      await shopifyFetch({
        query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
        variables: {
          cartId: cart.id,
          discountCodes: currentCodes
        }
      });

      setDiscountFeedback({
        type: 'success',
        message: `Discount code "${code}" removed`
      });
    } catch {
      setDiscountFeedback({
        type: 'error',
        message: 'Failed to remove discount code'
      });
    }
  };

  const handleProceedToPayment = async () => {
    // Validate form
    if (!billingAddress.firstName || !billingAddress.lastName || !billingAddress.email ||
        !billingAddress.phone || !billingAddress.address1 || !billingAddress.zip) {
      alert('Please fill in all required fields');
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      alert('Please select a delivery date and time');
      return;
    }

    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setIsProcessingCheckout(true);
    setCheckoutError(null);

    try {
      // For custom cart, use Stripe checkout
      if (isCustomCart) {
        // Save delivery info to cart
        const deliveryResponse = await fetch('/api/v1/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'delivery',
            date: deliveryDate?.toISOString(),
            time: deliveryTime,
            address: {
              address1: billingAddress.address1,
              address2: billingAddress.address2 || '',
              city: billingAddress.city,
              province: billingAddress.state,
              zip: billingAddress.zip,
              country: billingAddress.country,
            },
            phone: billingAddress.phone,
            instructions: deliveryInstructions,
          }),
        });

        if (!deliveryResponse.ok) {
          const data = await deliveryResponse.json();
          throw new Error(data.error || 'Failed to save delivery info');
        }

        // Create Stripe checkout session
        const checkoutResponse = await fetch('/api/v1/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: billingAddress.email,
          }),
        });

        const checkoutData = await checkoutResponse.json();

        if (!checkoutData.success) {
          throw new Error(checkoutData.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe checkout
        if (checkoutData.data.checkoutUrl) {
          window.location.href = checkoutData.data.checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        // Legacy: Store order info and redirect to custom payment page
        const orderInfo = {
          customer: {
            ...billingAddress
          },
          delivery: {
            date: deliveryDate,
            time: deliveryTime,
            instructions: deliveryInstructions,
            address: `${billingAddress.address1}${billingAddress.address2 ? ` ${billingAddress.address2}` : ''}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.zip}`
          },
          groupOrder: isGroupCheckout ? currentGroupOrder : null,
          cartId: cart?.id
        };

        localStorage.setItem('checkoutInfo', JSON.stringify(orderInfo));
        window.location.href = '/payment';
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
      setIsProcessingCheckout(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <>
        <div className="min-h-screen pt-12">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h1 className="font-cormorant text-4xl mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart to proceed with checkout.</p>
            <Link href="/products">
              <button className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors">
                SHOP PRODUCTS
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-8">
          {/* Back to Cart Link */}
          <div className="mb-6">
            <Link
              href="/order"
              className="inline-flex items-center text-gray-600 hover:text-gold-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shopping
            </Link>
          </div>

          <h1 className="font-cormorant text-4xl tracking-[0.15em] text-center mb-12">
            CHECKOUT
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Group Order Info - Hidden until Stripe setup */}
              {/* {isGroupCheckout && currentGroupOrder && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-cormorant text-xl mb-2">Group Order Checkout</h3>
                  <p className="text-gray-700">
                    You&apos;re checking out for the entire group. Total includes orders from {currentGroupOrder.participants.length} participants.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Group Code: <span className="font-mono font-bold">{currentGroupOrder.shareCode}</span>
                  </p>
                </div>
              )} */}

              {/* Customer Information */}
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="font-cormorant text-2xl mb-6">Customer Information</h2>
                
                {!isAuthenticated && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-sm mb-3">Already have an account?</p>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="text-gold-600 hover:underline text-sm"
                    >
                      Sign in for faster checkout →
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                      FIRST NAME *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.firstName}
                      onChange={(e) => setBillingAddress({...billingAddress, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                      LAST NAME *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.lastName}
                      onChange={(e) => setBillingAddress({...billingAddress, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                      EMAIL *
                    </label>
                    <input
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) => setBillingAddress({...billingAddress, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                      PHONE *
                    </label>
                    <input
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Schedule - Inline Picker */}
              <DeliveryDateTimePicker
                selectedDate={deliveryDate}
                selectedTime={deliveryTime}
                instructions={deliveryInstructions}
                onDateChange={setDeliveryDate}
                onTimeChange={setDeliveryTime}
                onInstructionsChange={setDeliveryInstructions}
              />

              {/* Delivery Address */}
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="font-cormorant text-2xl mb-6">Delivery Address</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                      STREET ADDRESS *
                    </label>
                    <input
                      type="text"
                      value={billingAddress.address1}
                      onChange={(e) => setBillingAddress({...billingAddress, address1: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                      APARTMENT, SUITE, ETC. (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={billingAddress.address2}
                      onChange={(e) => setBillingAddress({...billingAddress, address2: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                        CITY *
                      </label>
                      <input
                        type="text"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                        STATE *
                      </label>
                      <input
                        type="text"
                        value={billingAddress.state}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] text-gray-600 mb-2">
                        ZIP CODE *
                      </label>
                      <input
                        type="text"
                        value={billingAddress.zip}
                        onChange={(e) => setBillingAddress({...billingAddress, zip: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 border border-gray-200 sticky top-8">
                <h2 className="font-cormorant text-2xl mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.lines.edges.map(({ node }) => (
                    <div key={node.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{node.merchandise.product.title}</p>
                        <p className="text-gray-600">Qty: {node.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${(parseFloat(node.merchandise.price.amount) * node.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Discount Code Section */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      placeholder="Discount code"
                      disabled={isApplyingDiscount}
                      className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gold-600"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || !discountCode.trim()}
                      className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gold-600 transition-colors disabled:opacity-50"
                    >
                      {isApplyingDiscount ? 'APPLYING...' : 'APPLY'}
                    </button>
                  </div>
                  
                  {/* Discount Feedback */}
                  {discountFeedback.type && (
                    <p className={`text-xs mt-2 ${
                      discountFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {discountFeedback.message}
                    </p>
                  )}
                  
                  {/* Applied Discounts */}
                  {cart?.discountCodes && cart.discountCodes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {cart.discountCodes.map((discount) => (
                        <div key={discount.code} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                          <span className="text-sm text-green-700">
                            {discount.code} {discount.applicable && '✓ Applied'}
                          </span>
                          <button
                            onClick={() => handleRemoveDiscount(discount.code)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  {/* Show discount amount if applied */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${Math.abs(discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Loyalty Points - Disabled for now */}
                  {/* {isAuthenticated && customer?.metafields && (
                    <div className="pt-2 border-t">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm">Apply Loyalty Points</span>
                        <input
                          type="checkbox"
                          checked={applyLoyaltyPoints}
                          onChange={(e) => setApplyLoyaltyPoints(e.target.checked)}
                          className="rounded border-gray-300 text-gold-600 focus:ring-gold-600"
                        />
                      </label>
                      {applyLoyaltyPoints && (
                        <p className="text-xs text-green-600 mt-1">
                          -${loyaltyDiscount.toFixed(2)} discount applied
                        </p>
                      )}
                    </div>
                  )} */}
                  
                  <div className="flex justify-between font-medium text-lg pt-4 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <label className="flex items-start gap-2 mt-6 text-sm">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-gold-600 focus:ring-gold-600"
                  />
                  <span className="text-gray-600">
                    I confirm I am 21+ years old and agree to the{' '}
                    <Link href="/terms" className="text-gold-600 hover:underline">
                      terms and conditions
                    </Link>
                  </span>
                </label>

                {/* Checkout Error */}
                {checkoutError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                    {checkoutError}
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={!acceptTerms || !deliveryDate || !deliveryTime || isProcessingCheckout}
                  className={`w-full mt-6 py-4 font-medium tracking-[0.15em] transition-colors ${
                    acceptTerms && deliveryDate && deliveryTime && !isProcessingCheckout
                      ? 'bg-gold-600 text-gray-900 hover:bg-gold-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessingCheckout ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      PROCESSING...
                    </span>
                  ) : (
                    'PROCEED TO PAYMENT'
                  )}
                </button>

                {/* Security Badge */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Secure checkout powered by {isCustomCart ? 'Stripe' : 'Shopify'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <CustomerAuth
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo="/checkout"
      />

      <Footer />
    </>
  );
}