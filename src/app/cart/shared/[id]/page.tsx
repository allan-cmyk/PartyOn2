'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartContext } from '@/contexts/CartContext';
import { type SharedCartData } from '@/lib/cart/shareCart';

export default function SharedCartPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, openCart } = useCartContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedCart, setSharedCart] = useState<SharedCartData | null>(null);

  const shareId = params.id as string;

  useEffect(() => {
    async function loadSharedCart() {
      if (!shareId) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch shared cart data from API
        const response = await fetch(`/api/cart/share/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('This cart link has expired or is invalid');
          } else {
            setError('Failed to load shared cart');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to load shared cart');
          setLoading(false);
          return;
        }

        setSharedCart(data.cartData);

        // Add items to user's cart
        await addItemsToCart(data.cartData);

      } catch (err) {
        console.error('Error loading shared cart:', err);
        setError('Failed to load shared cart');
        setLoading(false);
      }
    }

    loadSharedCart();
  }, [shareId, addToCart, openCart, router]);

  async function addItemsToCart(cartData: SharedCartData) {
    try {
      // If no cart exists, the addToCart function will create one
      for (const variant of cartData.variants) {
        await addToCart(variant.id, variant.quantity);
      }

      // Open cart drawer to show the added items
      setTimeout(() => {
        openCart();
        setLoading(false);

        // Redirect to home page after a brief delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }, 500);

    } catch (err) {
      console.error('Error adding items to cart:', err);
      setError('Failed to add items to your cart');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading shared cart...</h2>
          <p className="text-gray-600">Adding items to your cart</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load cart</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm"
          >
            GO TO HOMEPAGE
          </button>
        </div>
      </div>
    );
  }

  // Success state (items added)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cart loaded successfully!</h2>
        <p className="text-gray-600 mb-4">
          {sharedCart?.variants.length} item{sharedCart?.variants.length !== 1 ? 's' : ''} added to your cart
        </p>
        <p className="text-gray-500 text-sm">
          Redirecting to homepage...
        </p>
      </div>
    </div>
  );
}