'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useGroupOrder, useJoinGroupOrder } from '@/lib/group-orders/hooks'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { useCartContext } from '@/contexts/CartContext'
import AgeVerificationModal from '@/components/AgeVerificationModal'

export default function GroupOrderLandingPage() {
  const params = useParams()
  const router = useRouter()
  const shareCode = params.code as string
  
  const { groupOrder, isLoading, error } = useGroupOrder(shareCode)
  const { setGroupOrderCode } = useGroupOrderContext()
  const { joinGroupOrder } = useJoinGroupOrder()
  const { cart } = useCartContext()
  
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Check if already in this group order
  const isAlreadyJoined = groupOrder?.participants.some(
    p => p.cartId === cart?.id
  )

  const handleJoinOrder = () => {
    setShowAgeVerification(true)
  }

  const handleAgeVerified = async () => {
    if (!groupOrder || !cart) return
    
    setIsJoining(true)
    setJoinError(null)
    
    try {
      await joinGroupOrder(groupOrder.id, {
        cartId: cart.id,
        customerId: localStorage.getItem('customerId') || undefined,
        guestName: 'Guest User', // In production, collect this info
      })
      
      // Set the group order code in context
      setGroupOrderCode(shareCode)
      
      // Redirect to products page
      router.push('/products')
    } catch (err) {
      setJoinError('Failed to join group order. Please try again.')
      console.error(err)
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600 tracking-[0.1em]">Loading group order...</p>
        </div>
      </div>
    )
  }

  if (error || !groupOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-cormorant mb-4">Group Order Not Found</h1>
          <p className="text-gray-600 mb-6">This group order link may have expired or been cancelled.</p>
          <Link href="/products">
            <button className="bg-gray-900 text-white px-6 py-3 tracking-[0.1em] hover:bg-gold transition-colors">
              BROWSE PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-500 bg-opacity-10 rounded-full mb-4">
              <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-cormorant tracking-[0.1em] mb-2">
              {groupOrder.name}
            </h1>
            <p className="text-gray-600">Hosted by {groupOrder.hostName}</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded p-6 mb-6">
            <h2 className="text-sm tracking-[0.1em] text-gray-600 mb-4">DELIVERY DETAILS</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gold-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">
                    {new Date(groupOrder.deliveryDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600">{groupOrder.deliveryTime}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gold-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium">{groupOrder.deliveryAddress.address1}</p>
                  {groupOrder.deliveryAddress.address2 && (
                    <p className="text-gray-600">{groupOrder.deliveryAddress.address2}</p>
                  )}
                  <p className="text-gray-600">
                    {groupOrder.deliveryAddress.city}, {groupOrder.deliveryAddress.province} {groupOrder.deliveryAddress.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <h2 className="text-sm tracking-[0.1em] text-gray-600 mb-4">
              PARTICIPANTS ({groupOrder.participants.length})
            </h2>
            <div className="space-y-2">
              {groupOrder.participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm">
                    {participant.guestName || `Participant ${index + 1}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {participant.itemCount} items
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Order Total</span>
              <span className="font-medium">${groupOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((groupOrder.totalAmount / groupOrder.minimumOrderAmount) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${groupOrder.minimumOrderAmount} minimum order
            </p>
          </div>

          {/* Action Buttons */}
          {groupOrder.status === 'active' && (
            <div className="space-y-3">
              {isAlreadyJoined ? (
                <>
                  <Link href="/products">
                    <button className="w-full bg-gray-900 text-white py-4 tracking-[0.15em] hover:bg-gold transition-colors">
                      CONTINUE SHOPPING
                    </button>
                  </Link>
                  <p className="text-center text-sm text-gray-600">
                    You&apos;ve already joined this group order
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={handleJoinOrder}
                    disabled={isJoining}
                    className="w-full bg-gold-500 text-gray-900 py-4 tracking-[0.15em] hover:bg-gold-600 transition-colors disabled:opacity-50"
                  >
                    {isJoining ? 'JOINING...' : 'JOIN THIS ORDER'}
                  </button>
                  {joinError && (
                    <p className="text-center text-sm text-red-600">{joinError}</p>
                  )}
                </>
              )}
            </div>
          )}

          {groupOrder.status === 'locked' && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">This order has been locked by the host and is no longer accepting new participants.</p>
              <Link href="/products">
                <button className="bg-gray-900 text-white px-6 py-3 tracking-[0.1em] hover:bg-gold transition-colors">
                  START NEW ORDER
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeVerification}
        onClose={() => setShowAgeVerification(false)}
        onVerify={handleAgeVerified}
      />
    </div>
  )
}