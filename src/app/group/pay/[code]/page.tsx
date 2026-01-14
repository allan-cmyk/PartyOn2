'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useGroupOrder } from '@/lib/group-orders/hooks'
import { useCartContext } from '@/contexts/CartContext'

interface PaymentBreakdown {
  subtotal: number
  taxAmount: number
  deliveryContribution: number
  total: number
}

interface CartItem {
  productId: string
  variantId: string
  title: string
  variantTitle: string | null
  quantity: number
  price: number
  imageUrl?: string
}

export default function ParticipantPaymentPage(): React.ReactElement {
  const params = useParams()
  const searchParams = useSearchParams()
  const shareCode = params.code as string

  const { groupOrder, isLoading: groupLoading, error: groupError } = useGroupOrder(shareCode)
  const { cart } = useCartContext()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null)
  const [items, setItems] = useState<CartItem[]>([])

  // Find current participant
  const currentParticipant = groupOrder?.participants.find(
    p => p.cartId === cart?.id
  )

  // Build items from cart (simplified - in production, this would come from cart context)
  const buildCartItems = useCallback((): CartItem[] => {
    // For demo, create mock items from participant data
    // In production, this would come from the actual cart
    if (!currentParticipant) return []

    // Mock items based on cart total
    const mockItems: CartItem[] = []
    if (currentParticipant.cartTotal && currentParticipant.cartTotal > 0) {
      mockItems.push({
        productId: 'mock-product',
        variantId: 'mock-variant',
        title: 'Your Selected Items',
        variantTitle: `${currentParticipant.itemCount || 1} items`,
        quantity: 1,
        price: currentParticipant.cartTotal,
      })
    }
    return mockItems
  }, [currentParticipant])

  // Calculate breakdown
  useEffect(() => {
    if (!currentParticipant) return

    const cartItems = buildCartItems()
    setItems(cartItems)

    const subtotal = currentParticipant.cartTotal || 0
    const taxAmount = Math.round(subtotal * 0.0825 * 100) / 100
    const deliveryContribution = 5 // Simplified - would be calculated server-side
    const total = Math.round((subtotal + taxAmount + deliveryContribution) * 100) / 100

    setBreakdown({ subtotal, taxAmount, deliveryContribution, total })
  }, [currentParticipant, buildCartItems])

  const handleCheckout = async (): Promise<void> => {
    if (!groupOrder || !currentParticipant || items.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(`/api/group-orders/${shareCode}/participant-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: currentParticipant.id,
          items: items,
          customerEmail: currentParticipant.guestEmail,
          customerName: currentParticipant.guestName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsProcessing(false)
    }
  }

  // Check for error from redirect
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  if (groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600 tracking-[0.1em]">Loading...</p>
        </div>
      </div>
    )
  }

  if (groupError || !groupOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-cormorant mb-4">Group Order Not Found</h1>
          <p className="text-gray-600 mb-6">This group order may have expired or been cancelled.</p>
          <Link href="/products">
            <button className="bg-gray-900 text-white px-6 py-3 tracking-[0.1em] hover:bg-gold-500 transition-colors">
              BROWSE PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!currentParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-cormorant mb-4">Not in This Group Order</h1>
          <p className="text-gray-600 mb-6">You need to join this group order before you can pay.</p>
          <Link href={`/group/${shareCode}`}>
            <button className="bg-gold-500 text-gray-900 px-6 py-3 tracking-[0.1em] hover:bg-gold-600 transition-colors">
              JOIN GROUP ORDER
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!breakdown || breakdown.subtotal <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-cormorant mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <Link href="/products">
            <button className="bg-gold-500 text-gray-900 px-6 py-3 tracking-[0.1em] hover:bg-gold-600 transition-colors">
              BROWSE PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href={`/group/${shareCode}`} className="text-gold-500 hover:text-gold-600 text-sm tracking-[0.1em] mb-4 inline-block">
              &larr; Back to Group Order
            </Link>
            <h1 className="text-3xl font-cormorant tracking-[0.1em] mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              {groupOrder.name}
            </p>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            {/* Participant Info */}
            <div className="flex items-center gap-3 pb-4 border-b mb-4">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{currentParticipant.guestName || 'Guest'}</p>
                <p className="text-sm text-gray-500">{currentParticipant.guestEmail}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({currentParticipant.itemCount || 0} items)</span>
                <span>${breakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8.25%)</span>
                <span>${breakdown.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery (your share)</span>
                <span>${breakdown.deliveryContribution.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                <span>Total</span>
                <span className="text-gold-600">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded p-4 mb-6">
              <p className="text-sm text-gray-500 tracking-[0.1em] mb-2">DELIVERY TO</p>
              <p className="font-medium">{groupOrder.deliveryAddress?.address1}</p>
              <p className="text-gray-600">
                {groupOrder.deliveryAddress?.city}, {groupOrder.deliveryAddress?.province} {groupOrder.deliveryAddress?.zip}
              </p>
              <p className="text-sm text-gold-600 mt-2">
                {new Date(groupOrder.deliveryDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })} at {groupOrder.deliveryTime}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-gold-500 text-gray-900 py-4 tracking-[0.15em] font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSING...
                </span>
              ) : (
                `PAY $${breakdown.total.toFixed(2)}`
              )}
            </button>

            {/* Security Note */}
            <p className="text-center text-xs text-gray-500 mt-4">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Stripe. Your payment info is never stored.
            </p>
          </div>

          {/* Group Order Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 tracking-[0.1em] mb-2">GROUP ORDER STATUS</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{groupOrder.participants.length} participants</span>
              <span className={`px-2 py-1 text-xs rounded ${
                groupOrder.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : groupOrder.status === 'locked'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {groupOrder.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
