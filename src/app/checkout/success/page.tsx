'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCustomerContext } from '@/contexts/CustomerContext';
import { trackMetaEvent } from '@/components/MetaPixel';
import { trackPurchase } from '@/lib/analytics/track';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, refreshCustomer } = useCustomerContext();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const purchaseEventFired = useRef(false);

  useEffect(() => {
    // Extract order info from URL params if available
    const order = searchParams?.get('order');
    const orderName = searchParams?.get('order_name');
    const orderTotal = searchParams?.get('total');
    const sessionId = searchParams?.get('session_id');

    // If we have a Stripe session_id, fetch session details
    async function fetchStripeSession() {
      if (sessionId && !orderNumber) {
        try {
          const response = await fetch(`/api/v1/checkout?session_id=${sessionId}`);
          const data = await response.json();
          if (data.success) {
            // Fire tracking events with Stripe session data
            if (!purchaseEventFired.current) {
              purchaseEventFired.current = true;
              const amount = data.data.amountTotal ? data.data.amountTotal / 100 : 0;
              trackPurchase(sessionId, amount);
              trackMetaEvent('Purchase', {
                content_type: 'product',
                value: amount,
                currency: data.data.currency?.toUpperCase() || 'USD',
                content_name: 'Stripe Order',
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      }
    }

    if (orderName) {
      setOrderNumber(orderName);
    } else if (order) {
      setOrderNumber(order);
    } else if (sessionId) {
      // For Stripe checkout, show session ID as reference
      setOrderNumber(`Session: ${sessionId.substring(0, 8)}...`);
      fetchStripeSession();
    }

    // Fire purchase tracking events (only once) for non-Stripe checkouts
    if (!purchaseEventFired.current && !sessionId) {
      purchaseEventFired.current = true;

      // Fire Vercel Analytics purchase event
      trackPurchase(
        orderName || order || 'Unknown',
        orderTotal ? parseFloat(orderTotal) : 0
      );

      // Fire Meta Pixel Purchase event
      trackMetaEvent('Purchase', {
        content_type: 'product',
        value: orderTotal ? parseFloat(orderTotal) : 0,
        currency: 'USD',
        content_name: orderName || order || 'Order',
      });
    }

    // Refresh customer data to get latest orders
    if (isAuthenticated) {
      refreshCustomer();
    }

    // Clear cart from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shopify_cart_id');
      localStorage.removeItem('cart_id');
    }
  }, [searchParams, isAuthenticated, refreshCustomer, orderNumber]);

  return (
    <>
      <OldFashionedNavigation />
      
      <main className="min-h-screen">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80 w-full">
          <img
            src="/images/checkout/thank-you-hero.png"
            alt="Thank you for your order"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h1 className="font-cormorant text-5xl md:text-6xl text-white tracking-[0.15em] drop-shadow-lg">
              THANK YOU!
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 md:px-12 py-12 text-center">

          <p className="text-lg text-gray-600 mb-8">
            Your order has been successfully placed and our team is preparing your delivery.
          </p>

          {orderNumber && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8 inline-block">
              <p className="text-sm tracking-[0.1em] text-gray-600 mb-2">ORDER NUMBER</p>
              <p className="font-cormorant text-2xl">{orderNumber}</p>
            </div>
          )}

          <div className="bg-gold/10 border border-gold/30 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
            <h2 className="font-cormorant text-xl mb-3">What Happens Next?</h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-gold mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>You&apos;ll receive an order confirmation email shortly with all the details</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-gold mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Our team will contact you 24 hours before delivery to confirm timing</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-gold mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Please have a valid ID ready for age verification upon delivery</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 mb-8">
            {isAuthenticated ? (
              <Link 
                href="/account/orders"
                className="inline-block px-8 py-3 bg-gold text-gray-900 text-sm tracking-[0.15em] hover:bg-gold/90 transition-colors"
              >
                VIEW ORDER DETAILS
              </Link>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Create an account to track your order and save time on future purchases
                </p>
                <Link
                  href="/account"
                  className="inline-block px-8 py-4 bg-yellow-400 text-gray-900 text-sm font-semibold tracking-[0.15em] rounded-lg hover:bg-yellow-500 transition-colors shadow-md"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            )}
          </div>

          <Link 
            href="/products"
            className="inline-block px-8 py-3 border border-gray-300 text-gray-700 text-sm tracking-[0.15em] hover:border-gold transition-colors"
          >
            CONTINUE SHOPPING
          </Link>

          {/* Contact Info */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Questions about your order?</p>
            <p className="text-lg">
              Call us at{' '}
              <a href="tel:737-371-9700" className="text-gold hover:underline">
                (737) 371-9700
              </a>
              {' '}or email{' '}
              <a href="mailto:info@partyondelivery.com" className="text-gold hover:underline">
                info@partyondelivery.com
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <OldFashionedNavigation forceScrolled={true} />
        <div className="pt-32 pb-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 mx-auto rounded"></div>
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}