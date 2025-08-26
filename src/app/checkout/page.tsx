'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import DeliveryScheduler from '@/components/DeliveryScheduler';
import { useCart } from '@/lib/shopify/hooks/useCart';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { useGroupOrderContext } from '@/contexts/GroupOrderContext';
import CustomerAuth from '@/components/CustomerAuth';

export default function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const { customer, isAuthenticated } = useCustomerContext();
  const { isInGroupOrder, currentGroupOrder, isHost } = useGroupOrderContext();
  
  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<{
    date: Date | null;
    time: string;
    instructions: string;
    isExpress: boolean;
  } | null>(null);
  
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

  const [applyLoyaltyPoints, setApplyLoyaltyPoints] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

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

  // Calculate totals
  const subtotal = cart?.lines.edges.reduce((total, { node }) => {
    return total + (parseFloat(node.merchandise.price.amount) * node.quantity);
  }, 0) || 0;

  const deliveryFee = deliveryDetails?.isExpress ? 50 : 25;
  const tax = subtotal * 0.0825; // Texas sales tax
  
  // Calculate loyalty discount if applicable
  const loyaltyPoints = customer?.metafields?.find(m => m.key === 'points')?.value;
  const pointsValue = typeof loyaltyPoints === 'number' ? loyaltyPoints : 
                      typeof loyaltyPoints === 'string' ? parseInt(loyaltyPoints, 10) : 0;
  const loyaltyDiscount = applyLoyaltyPoints && pointsValue > 0 ? 
    Math.min(Math.floor(pointsValue / 100) * 10, subtotal * 0.5) : 0;
  
  const total = subtotal + deliveryFee + tax - loyaltyDiscount;

  // Check if this is a group order checkout
  const isGroupCheckout = isInGroupOrder && isHost;

  const handleProceedToPayment = async () => {
    // Validate form
    if (!billingAddress.firstName || !billingAddress.lastName || !billingAddress.email || 
        !billingAddress.phone || !billingAddress.address1 || !billingAddress.zip) {
      alert('Please fill in all required fields');
      return;
    }

    if (!deliveryDetails) {
      setShowDeliveryScheduler(true);
      return;
    }

    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    // For authenticated users, redirect to Shopify checkout
    if (cart?.checkoutUrl) {
      // Add delivery notes to checkout attributes
      const checkoutWithNotes = `${cart.checkoutUrl}&attributes[delivery_date]=${deliveryDetails.date?.toISOString()}&attributes[delivery_time]=${deliveryDetails.time}&attributes[delivery_instructions]=${deliveryDetails.instructions}`;
      
      if (isGroupCheckout && currentGroupOrder) {
        // Add group order info to checkout
        const groupCheckoutUrl = `${checkoutWithNotes}&attributes[group_order_id]=${currentGroupOrder.id}&attributes[group_order_code]=${currentGroupOrder.shareCode}`;
        window.location.href = groupCheckoutUrl;
      } else {
        window.location.href = checkoutWithNotes;
      }
    }
  };

  if (cartLoading) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
        </div>
      </>
    );
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen pt-32">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h1 className="font-cormorant text-4xl mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart to proceed with checkout.</p>
            <Link href="/products">
              <button className="px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors">
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
      <OldFashionedNavigation />
      
      <main className="min-h-screen pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="font-cormorant text-4xl tracking-[0.15em] text-center mb-12">
            CHECKOUT
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Group Order Info */}
              {isGroupCheckout && currentGroupOrder && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-cormorant text-xl mb-2">Group Order Checkout</h3>
                  <p className="text-gray-700">
                    You&apos;re checking out for the entire group. Total includes orders from {currentGroupOrder.participants.length} participants.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Group Code: <span className="font-mono font-bold">{currentGroupOrder.shareCode}</span>
                  </p>
                </div>
              )}

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

              {/* Delivery Schedule */}
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="font-cormorant text-2xl mb-6">Delivery Schedule</h2>
                
                {deliveryDetails ? (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Date:</span> {deliveryDetails.date?.toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Time:</span> {deliveryDetails.time}
                    </p>
                    {deliveryDetails.instructions && (
                      <p className="text-gray-700">
                        <span className="font-medium">Instructions:</span> {deliveryDetails.instructions}
                      </p>
                    )}
                    <button 
                      onClick={() => setShowDeliveryScheduler(true)}
                      className="text-gold-600 hover:underline text-sm mt-2"
                    >
                      Change delivery schedule →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeliveryScheduler(true)}
                    className="w-full py-3 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors"
                  >
                    SELECT DELIVERY DATE & TIME
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 border border-gray-200 sticky top-32">
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
                  
                  {/* Loyalty Points */}
                  {isAuthenticated && customer?.metafields && (
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
                  )}
                  
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

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={!acceptTerms || !deliveryDetails}
                  className={`w-full mt-6 py-4 font-medium tracking-[0.15em] transition-colors ${
                    acceptTerms && deliveryDetails
                      ? 'bg-gold-600 text-white hover:bg-gold-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  PROCEED TO PAYMENT
                </button>

                {/* Security Badge */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure checkout powered by Shopify
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delivery Scheduler Modal */}
      <DeliveryScheduler
        isOpen={showDeliveryScheduler}
        onClose={() => setShowDeliveryScheduler(false)}
        onConfirm={(date, time, instructions, isExpress) => {
          setDeliveryDetails({ date, time, instructions, isExpress: isExpress || false });
          setShowDeliveryScheduler(false);
        }}
        subtotal={subtotal}
      />

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