'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useGroupOrder, useJoinGroupOrder } from '@/lib/group-orders/hooks'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { useCartContext } from '@/contexts/CartContext'
import AgeVerificationModal from '@/components/AgeVerificationModal'
import GroupOrderItems from '@/components/group-orders/GroupOrderItems'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/track'

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
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  // Check if already in this group order
  const isAlreadyJoined = groupOrder?.participants.some(
    p => p.cartId === cart?.id
  )

  const handleJoinOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !guestEmail.trim()) {
      setJoinError('Please enter your name and email')
      return
    }
    setShowAgeVerification(true)
  }

  const handleAgeVerified = async () => {
    if (!groupOrder) return

    setIsJoining(true)
    setJoinError(null)

    try {
      // If user doesn't have a cart yet, save join info and redirect to products
      // The group order will be joined when they add their first item
      if (!cart) {
        // Store pending join info in localStorage
        localStorage.setItem('pendingGroupOrderJoin', JSON.stringify({
          groupOrderId: groupOrder.id,
          shareCode: shareCode,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          customerId: localStorage.getItem('customerId') || undefined,
        }))

        // Set the group order code in context
        setGroupOrderCode(shareCode)

        // Track join group order event (pending)
        trackEvent(ANALYTICS_EVENTS.JOIN_GROUP_ORDER, {
          group_order_id: groupOrder.id,
          share_code: shareCode,
          status: 'pending_cart'
        })

        // Redirect to order page to add items
        // Using window.location for more reliable redirect
        window.location.href = '/order?joinGroup=' + shareCode
        return
      }

      await joinGroupOrder(groupOrder.id, {
        cartId: cart.id,
        customerId: localStorage.getItem('customerId') || undefined,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
      })

      // Track join group order event
      trackEvent(ANALYTICS_EVENTS.JOIN_GROUP_ORDER, {
        group_order_id: groupOrder.id,
        share_code: shareCode
      })

      // Set the group order code in context
      setGroupOrderCode(shareCode)

      // Redirect to order page to start shopping
      router.push('/order')
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
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-cormorant text-gray-900 mb-1">
                  {groupOrder.name}
                </h1>
                <p className="text-gray-600">Hosted by {groupOrder.hostName}</p>
              </div>
              {/* FREE DELIVERY Badge */}
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">FREE DELIVERY</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {new Date(groupOrder.deliveryDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {' '}{groupOrder.deliveryTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{groupOrder.deliveryAddress.address1}, {groupOrder.deliveryAddress.city}</span>
              </div>
            </div>
          </div>

          {/* Join Form or Shopping Section */}
          {groupOrder.status === 'active' && !isAlreadyJoined && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-cormorant text-gray-900 mb-4">Join This Group Order</h2>
              <form onSubmit={handleJoinOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {joinError && (
                  <p className="text-sm text-red-600">{joinError}</p>
                )}
                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full bg-gold-600 text-gray-900 py-3 font-medium tracking-[0.1em] hover:bg-gold-700 transition-colors disabled:opacity-50"
                >
                  {isJoining ? 'JOINING...' : 'JOIN & START SHOPPING'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  You&apos;ll need to verify you&apos;re 21+ to continue
                </p>
              </form>
            </div>
          )}

          {/* Already Joined - Continue Shopping */}
          {groupOrder.status === 'active' && isAlreadyJoined && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-medium">You&apos;re part of this group order!</p>
                  <p className="text-sm text-gray-600">Add items to your cart and checkout when ready.</p>
                </div>
                <Link href="/products">
                  <button className="bg-gold-600 text-gray-900 px-6 py-3 font-medium tracking-[0.1em] hover:bg-gold-700 transition-colors">
                    SHOP NOW
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Closed/Locked Status */}
          {(groupOrder.status === 'closed' || groupOrder.status === 'locked') && !isAlreadyJoined && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-amber-800 font-medium">This group is closed to new participants</p>
                  <p className="text-sm text-amber-700 mt-1">Contact the host if you need to join.</p>
                </div>
              </div>
            </div>
          )}

          {/* What's Been Ordered */}
          <GroupOrderItems shareCode={shareCode} className="mb-6" />

          {/* Participants List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-cormorant text-gray-900 mb-4">
              Participants ({groupOrder.participants.length})
            </h3>
            {groupOrder.participants.length === 0 ? (
              <p className="text-gray-500 text-sm">No one has joined yet. Be the first!</p>
            ) : (
              <div className="space-y-2">
                {groupOrder.participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-900">
                      {participant.guestName || `Participant ${index + 1}`}
                    </span>
                    <div className="flex items-center gap-3">
                      {participant.status === 'checked_out' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Checked out
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Shopping
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {participant.itemCount || 0} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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