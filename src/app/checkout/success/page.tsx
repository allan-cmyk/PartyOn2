'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCustomerContext } from '@/contexts/CustomerContext';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, refreshCustomer } = useCustomerContext();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Extract order info from URL params if available
    const order = searchParams.get('order');
    const orderName = searchParams.get('order_name');
    
    if (orderName) {
      setOrderNumber(orderName);
    } else if (order) {
      setOrderNumber(order);
    }

    // Refresh customer data to get latest orders
    if (isAuthenticated) {
      refreshCustomer();
    }

    // Clear cart from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shopify_cart_id');
    }
  }, [searchParams, isAuthenticated, refreshCustomer]);

  return (
    <>
      <OldFashionedNavigation />
      
      <main className="min-h-screen pt-32">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-12 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="font-cormorant text-4xl tracking-[0.15em] mb-4">
            THANK YOU FOR YOUR ORDER
          </h1>

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
                className="inline-block px-8 py-3 bg-gold text-white text-sm tracking-[0.15em] hover:bg-gold/90 transition-colors"
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
                  className="inline-block px-8 py-3 bg-gold text-white text-sm tracking-[0.15em] hover:bg-gold/90 transition-colors"
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
              <a href="tel:512-555-0123" className="text-gold hover:underline">
                (512) 555-0123
              </a>
              {' '}or email{' '}
              <a href="mailto:orders@partyondelivery.com" className="text-gold hover:underline">
                orders@partyondelivery.com
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}