'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { useCartContext } from '@/contexts/CartContext'
import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder'
import GroupOrderItems from '@/components/group-orders/GroupOrderItems'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/track'

export default function GroupOrderDashboard() {
  const router = useRouter()
  const { currentGroupOrder, isHost, isInGroupOrder, refreshGroupOrder, groupOrderCode } = useGroupOrderContext()
  const { cart } = useCartContext()
  const [showShareModal, setShowShareModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Redirect if not in a group order or not the host
  // But don't redirect while still loading (code set but order not loaded yet)
  useEffect(() => {
    // Still loading - code is set but order hasn't loaded yet
    if (groupOrderCode && !currentGroupOrder) {
      return
    }

    if (!isInGroupOrder) {
      router.push('/products')
    } else if (!isHost) {
      router.push('/products')
    }
  }, [isInGroupOrder, isHost, router, groupOrderCode, currentGroupOrder])

  // Refresh group order data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGroupOrder()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [refreshGroupOrder])

  const handleCloseGroup = async () => {
    if (!currentGroupOrder) return

    const customerId = localStorage.getItem('customerId')
    if (!customerId) {
      alert('Please log in to continue')
      return
    }

    if (!confirm('Close this group? New participants won\'t be able to join, but existing participants can still checkout.')) {
      return
    }

    setIsClosing(true)
    try {
      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/lock-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostCustomerId: customerId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close group')
      }

      // Track close group order event
      trackEvent(ANALYTICS_EVENTS.LOCK_GROUP_ORDER, {
        group_order_id: currentGroupOrder.id,
        participant_count: currentGroupOrder.participants.length,
        total_amount: currentGroupOrder.totalAmount || 0
      })

      refreshGroupOrder()
    } catch (error) {
      console.error('Error closing group:', error)
      alert(error instanceof Error ? error.message : 'Failed to close group. Please try again.')
    } finally {
      setIsClosing(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return
    
    try {
      const customerId = localStorage.getItem('customerId')
      if (!customerId || !currentGroupOrder) return
      
      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/remove-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          hostCustomerId: customerId,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove participant')
      }
      
      refreshGroupOrder()
    } catch (error) {
      console.error('Error removing participant:', error)
      alert('Failed to remove participant. Please try again.')
    }
  }

  if (!currentGroupOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  const totalItems = currentGroupOrder.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
  const checkedOutCount = currentGroupOrder.participants.filter(p => p.status === 'checked_out').length
  const shoppingCount = currentGroupOrder.participants.filter(p => p.status === 'active').length
  const isGroupActive = currentGroupOrder.status === 'active'
  const isGroupClosed = currentGroupOrder.status === 'closed' || currentGroupOrder.status === 'locked'

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-cormorant text-gray-900">
                    {currentGroupOrder.name}
                  </h1>
                  {/* Status Badge */}
                  {isGroupActive && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                  )}
                  {isGroupClosed && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Closed</span>
                  )}
                </div>
                <p className="text-gray-600">
                  Share Code: <span className="font-mono font-bold">{currentGroupOrder.shareCode}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* FREE DELIVERY Badge */}
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">FREE DELIVERY</span>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 border border-gold-600 text-gray-900 hover:bg-gold-50 transition-colors tracking-[0.1em]"
                >
                  SHARE
                </button>
                {isGroupActive && (
                  <button
                    onClick={handleCloseGroup}
                    disabled={isClosing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors tracking-[0.1em]"
                  >
                    {isClosing ? 'CLOSING...' : 'CLOSE GROUP'}
                  </button>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">DELIVERY DATE</p>
                <p className="font-medium text-gray-900">
                  {new Date(currentGroupOrder.deliveryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">DELIVERY TIME</p>
                <p className="font-medium text-gray-900">{currentGroupOrder.deliveryTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">DELIVERY ADDRESS</p>
                <p className="font-medium text-gray-900">
                  {currentGroupOrder.deliveryAddress.address1}
                  {currentGroupOrder.deliveryAddress.address2 && `, ${currentGroupOrder.deliveryAddress.address2}`}
                  <br />
                  {currentGroupOrder.deliveryAddress.city}, {currentGroupOrder.deliveryAddress.province} {currentGroupOrder.deliveryAddress.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Progress Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-cormorant text-gray-900 mb-4">Checkout Progress</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gold-600">
                  {currentGroupOrder.participants.length}
                </p>
                <p className="text-sm text-gray-600 tracking-[0.1em]">PARTICIPANTS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {checkedOutCount}
                </p>
                <p className="text-sm text-gray-600 tracking-[0.1em]">CHECKED OUT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {shoppingCount}
                </p>
                <p className="text-sm text-gray-600 tracking-[0.1em]">STILL SHOPPING</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold-600">
                  {totalItems}
                </p>
                <p className="text-sm text-gray-600 tracking-[0.1em]">TOTAL ITEMS</p>
              </div>
            </div>

            {/* Checkout Progress Bar */}
            {currentGroupOrder.participants.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Checkout Progress</span>
                  <span className="text-sm font-medium">
                    {checkedOutCount}/{currentGroupOrder.participants.length} checked out
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${(checkedOutCount / currentGroupOrder.participants.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* What's Been Ordered */}
          <GroupOrderItems shareCode={currentGroupOrder.shareCode} className="mb-6" />

          {/* Participants List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-cormorant text-gray-900 mb-4">Participants</h2>

            {currentGroupOrder.participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No participants yet. Share the group order to get started!</p>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-gold-600 text-gray-900 px-6 py-2 hover:bg-gold-700 transition-colors tracking-[0.1em]"
                >
                  SHARE ORDER
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentGroupOrder.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {participant.guestName || 'Anonymous Guest'}
                            </p>
                            {participant.cartId === cart?.id && (
                              <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded">YOU</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {participant.guestEmail || 'No email'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Checkout Status Badge */}
                        {participant.status === 'checked_out' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mb-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Checked out
                            </span>
                            {participant.shopifyOrderName && (
                              <p className="text-xs text-gray-500">{participant.shopifyOrderName}</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mb-1">
                              Shopping
                            </span>
                            <p className="text-xs text-gray-500">{participant.itemCount || 0} items</p>
                          </div>
                        )}

                        {/* Remove Button (only for active participants who aren't the host) */}
                        {isHost && participant.cartId !== cart?.id && participant.status !== 'checked_out' && (
                          <button
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                            title="Remove participant"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/products">
              <button className="px-6 py-3 border border-gray-300 hover:border-gold-600 transition-colors tracking-[0.1em]">
                ADD YOUR ITEMS
              </button>
            </Link>
            <Link href={`/group/${currentGroupOrder.shareCode}`}>
              <button className="px-6 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em]">
                VIEW GROUP PAGE
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && currentGroupOrder && (
        <ShareGroupOrder
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareCode={currentGroupOrder.shareCode}
          eventName={currentGroupOrder.name}
        />
      )}
    </div>
  )
}