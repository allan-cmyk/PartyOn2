'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGroupOrder } from '@/lib/group-orders/hooks'
import { formatPrice } from '@/lib/shopify/utils'

export default function GroupCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const shareCode = params.code as string
  
  const { groupOrder, isLoading } = useGroupOrder(shareCode)
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Get host info from localStorage
  const [hostEmail, setHostEmail] = useState('')
  const [hostPhone, setHostPhone] = useState('')
  const customerId = typeof window !== 'undefined' ? localStorage.getItem('customerId') : null

  useEffect(() => {
    // Get customer email from localStorage if available
    const storedEmail = localStorage.getItem('customerEmail')
    if (storedEmail) setHostEmail(storedEmail)
  }, [])

  const handleCreateCheckout = async () => {
    if (!hostEmail) {
      setError('Please enter your email address')
      return
    }

    if (!customerId || !groupOrder) {
      setError('Invalid group order or not logged in')
      return
    }

    setIsCreatingCheckout(true)
    setError(null)

    try {
      const response = await fetch(`/api/group-orders/${shareCode}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostCustomerId: customerId,
          hostEmail,
          hostPhone: hostPhone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      setCheckoutUrl(data.checkoutUrl)
      
      // Redirect to Shopify checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      console.error('Error creating checkout:', err)
      setError(err instanceof Error ? err.message : 'Failed to create checkout')
    } finally {
      setIsCreatingCheckout(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group order...</p>
        </div>
      </div>
    )
  }

  if (!groupOrder || groupOrder.status !== 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-cormorant mb-4">Invalid Group Order</h1>
          <p className="text-gray-600 mb-6">This group order is not ready for checkout.</p>
          <button 
            onClick={() => router.push('/group/dashboard')}
            className="bg-gold-600 text-white px-6 py-3 hover:bg-gold-700 transition-colors tracking-[0.1em]"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  const totalAmount = groupOrder.participants
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.cartTotal || 0), 0)
  
  const totalItems = groupOrder.participants
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.itemCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cormorant text-gray-900 mb-2">
              Complete Group Order
            </h1>
            <p className="text-gray-600">
              Review and finalize your group order for {groupOrder.name}
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-cormorant mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Group Name</span>
                <span className="font-medium">{groupOrder.name}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium">
                  {groupOrder.participants.filter(p => p.status === 'active').length} people
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Items</span>
                <span className="font-medium">{totalItems} items</span>
              </div>
              
              <div className="flex justify-between py-2 border-t pt-4">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-lg font-bold text-gold-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-cormorant mb-4">Delivery Details</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">DATE</p>
                <p className="font-medium">
                  {new Date(groupOrder.deliveryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">TIME</p>
                <p className="font-medium">{groupOrder.deliveryTime}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">ADDRESS</p>
                <p className="font-medium">
                  {groupOrder.deliveryAddress.address1}
                  {groupOrder.deliveryAddress.address2 && `, ${groupOrder.deliveryAddress.address2}`}
                  <br />
                  {groupOrder.deliveryAddress.city}, {groupOrder.deliveryAddress.province} {groupOrder.deliveryAddress.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Host Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-cormorant mb-4">Billing Information</h2>
            <p className="text-sm text-gray-600 mb-4">
              As the host, you'll receive the invoice for the entire group order.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-gold-600 focus:border-gold-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={hostPhone}
                  onChange={(e) => setHostPhone(e.target.value)}
                  placeholder="(512) 555-0123"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-gold-600 focus:border-gold-600"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {checkoutUrl && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-medium mb-2">Checkout created successfully!</p>
              <p className="text-sm">Redirecting to payment page...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/group/dashboard')}
              className="px-6 py-3 border border-gray-300 hover:border-gold-600 transition-colors tracking-[0.1em]"
            >
              BACK TO DASHBOARD
            </button>
            
            <button
              onClick={handleCreateCheckout}
              disabled={isCreatingCheckout || !hostEmail || !!checkoutUrl}
              className={`px-8 py-3 tracking-[0.1em] transition-colors ${
                isCreatingCheckout || !hostEmail || !!checkoutUrl
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gold-600 text-white hover:bg-gold-700'
              }`}
            >
              {isCreatingCheckout ? 'CREATING CHECKOUT...' : 'PROCEED TO PAYMENT'}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gold-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You'll receive an invoice via email with a secure payment link
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gold-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete payment using any major credit card
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gold-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Order confirmation will be sent to all participants
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gold-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Delivery on {new Date(groupOrder.deliveryDate).toLocaleDateString()} at {groupOrder.deliveryTime}
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}