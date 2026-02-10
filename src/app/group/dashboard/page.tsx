'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { useCartContext } from '@/contexts/CartContext'
import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder'
import GroupOrderItems from '@/components/group-orders/GroupOrderItems'
import EnableMultiPaymentModal from '@/components/group-orders/EnableMultiPaymentModal'
import PaymentStatusSection from '@/components/group-orders/PaymentStatusSection'
import HostDecisionModal from '@/components/group-orders/HostDecisionModal'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/track'
import { type GroupPaymentStatus } from '@/lib/group-orders/types'

export default function GroupOrderDashboard() {
  const router = useRouter()
  const { currentGroupOrder, isHost, isInGroupOrder, refreshGroupOrder, groupOrderCode } = useGroupOrderContext()
  const { cart } = useCartContext()
  const [showShareModal, setShowShareModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showEnableMultiPaymentModal, setShowEnableMultiPaymentModal] = useState(false)
  const [showHostDecisionModal, setShowHostDecisionModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<GroupPaymentStatus | null>(null)

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

  // Fetch payment status when multi-payment is enabled
  const fetchPaymentStatus = useCallback(async () => {
    if (!currentGroupOrder?.multiPaymentEnabled) return

    try {
      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/payment-status`)
      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch payment status:', error)
    }
  }, [currentGroupOrder?.shareCode, currentGroupOrder?.multiPaymentEnabled])

  // Poll payment status every 10 seconds when multi-payment is enabled
  useEffect(() => {
    if (!currentGroupOrder?.multiPaymentEnabled) {
      setPaymentStatus(null)
      return
    }

    // Initial fetch
    fetchPaymentStatus()

    // Poll every 10 seconds
    const interval = setInterval(fetchPaymentStatus, 10000)

    return () => clearInterval(interval)
  }, [currentGroupOrder?.multiPaymentEnabled, fetchPaymentStatus])

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    )
  }

  const totalItems = currentGroupOrder.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
  const checkedOutCount = currentGroupOrder.participants.filter(p => p.status === 'checked_out').length
  const shoppingCount = currentGroupOrder.participants.filter(p => p.status === 'active').length
  const isGroupActive = currentGroupOrder.status === 'active'
  const isGroupClosed = currentGroupOrder.status === 'closed' || currentGroupOrder.status === 'locked'

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="w-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading text-gray-900">
                    {currentGroupOrder.name}
                  </h1>
                  {/* Status Badge */}
                  {isGroupActive && (
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">Active</span>
                  )}
                  {isGroupClosed && (
                    <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold">Closed</span>
                  )}
                </div>
                <p className="text-lg text-gray-600">
                  Share Code: <span className="font-mono font-bold text-xl">{currentGroupOrder.shareCode}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* FREE DELIVERY Badge */}
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base font-bold">FREE DELIVERY</span>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-5 py-2.5 border-2 border-brand-yellow text-gray-900 hover:bg-yellow-50 transition-colors tracking-[0.1em] text-base font-bold"
                >
                  SHARE
                </button>
                {isGroupActive && (
                  <button
                    onClick={handleCloseGroup}
                    disabled={isClosing}
                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors tracking-[0.1em] text-base font-bold"
                  >
                    {isClosing ? 'CLOSING...' : 'CLOSE GROUP'}
                  </button>
                )}
                {isGroupActive && !currentGroupOrder.multiPaymentEnabled && currentGroupOrder.participants.length > 0 && (
                  <button
                    onClick={() => setShowEnableMultiPaymentModal(true)}
                    className="px-5 py-2.5 bg-brand-yellow text-gray-900 hover:bg-yellow-600 transition-colors tracking-[0.1em] text-base font-bold"
                  >
                    ENABLE SPLIT PAY
                  </button>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t">
              <div>
                <p className="text-base text-gray-500 tracking-[0.1em] mb-1 font-semibold">DELIVERY DATE</p>
                <p className="font-bold text-gray-900 text-lg">
                  {new Date(currentGroupOrder.deliveryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500 tracking-[0.1em] mb-1 font-semibold">DELIVERY TIME</p>
                <p className="font-bold text-gray-900 text-lg">{currentGroupOrder.deliveryTime}</p>
              </div>
              <div>
                <p className="text-base text-gray-500 tracking-[0.1em] mb-1 font-semibold">DELIVERY ADDRESS</p>
                <p className="font-bold text-gray-900 text-lg">
                  {currentGroupOrder.deliveryAddress.address1}
                  {currentGroupOrder.deliveryAddress.address2 && `, ${currentGroupOrder.deliveryAddress.address2}`}
                  <br />
                  {currentGroupOrder.deliveryAddress.city}, {currentGroupOrder.deliveryAddress.province} {currentGroupOrder.deliveryAddress.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Progress Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-heading text-gray-900 mb-6">Checkout Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-4xl md:text-5xl font-heading text-brand-yellow">
                  {currentGroupOrder.participants.length}
                </p>
                <p className="text-base text-gray-700 tracking-[0.1em] font-semibold mt-2">PARTICIPANTS</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-4xl md:text-5xl font-heading text-green-600">
                  {checkedOutCount}
                </p>
                <p className="text-base text-gray-700 tracking-[0.1em] font-semibold mt-2">CHECKED OUT</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-4xl md:text-5xl font-heading text-yellow-600">
                  {shoppingCount}
                </p>
                <p className="text-base text-gray-700 tracking-[0.1em] font-semibold mt-2">STILL SHOPPING</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-4xl md:text-5xl font-heading text-brand-yellow">
                  {totalItems}
                </p>
                <p className="text-base text-gray-700 tracking-[0.1em] font-semibold mt-2">TOTAL ITEMS</p>
              </div>
            </div>

            {/* Checkout Progress Bar */}
            {currentGroupOrder.participants.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between mb-3">
                  <span className="text-base text-gray-600 font-semibold">Checkout Progress</span>
                  <span className="text-base font-bold">
                    {checkedOutCount}/{currentGroupOrder.participants.length} checked out
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${(checkedOutCount / currentGroupOrder.participants.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Status Section (when multi-payment enabled) */}
          {currentGroupOrder.multiPaymentEnabled && paymentStatus && (
            <PaymentStatusSection
              paymentStatus={paymentStatus}
              onHostDecisionNeeded={() => setShowHostDecisionModal(true)}
              shareCode={currentGroupOrder.shareCode}
            />
          )}

          {/* What's Been Ordered */}
          <GroupOrderItems shareCode={currentGroupOrder.shareCode} className="mb-6" />

          {/* Participants List */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-heading text-gray-900 mb-6">Participants</h2>

            {currentGroupOrder.participants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500 mb-6">No participants yet. Share the group order to get started!</p>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-brand-yellow text-gray-900 px-8 py-3 hover:bg-yellow-600 transition-colors tracking-[0.1em] text-lg font-bold"
                >
                  SHARE ORDER
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentGroupOrder.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="border-2 border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-7 h-7 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-gray-900 text-lg">
                              {participant.guestName || 'Anonymous Guest'}
                            </p>
                            {participant.cartId === cart?.id && (
                              <span className="text-sm bg-yellow-100 text-yellow-600 px-3 py-1 rounded font-semibold">YOU</span>
                            )}
                          </div>
                          <p className="text-base text-gray-500">
                            {participant.guestEmail || 'No email'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Checkout Status Badge */}
                        {participant.status === 'checked_out' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full mb-1 font-semibold">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Checked out
                            </span>
                            {participant.shopifyOrderName && (
                              <p className="text-sm text-gray-500">{participant.shopifyOrderName}</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center text-sm bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full mb-1 font-semibold">
                              Shopping
                            </span>
                            <p className="text-sm text-gray-500 font-medium">{participant.itemCount || 0} items</p>
                          </div>
                        )}

                        {/* Remove Button (only for active participants who aren't the host) */}
                        {isHost && participant.cartId !== cart?.id && participant.status !== 'checked_out' && (
                          <button
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded transition-colors"
                            title="Remove participant"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/products">
              <button className="px-8 py-4 border-2 border-gray-300 hover:border-brand-yellow transition-colors tracking-[0.1em] text-lg font-bold">
                ADD YOUR ITEMS
              </button>
            </Link>
            <Link href={`/group/${currentGroupOrder.shareCode}`}>
              <button className="px-8 py-4 bg-brand-yellow text-gray-900 hover:bg-yellow-600 transition-colors tracking-[0.1em] text-lg font-bold">
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

      {/* Enable Multi-Payment Modal */}
      {showEnableMultiPaymentModal && currentGroupOrder && (
        <EnableMultiPaymentModal
          isOpen={showEnableMultiPaymentModal}
          onClose={() => setShowEnableMultiPaymentModal(false)}
          shareCode={currentGroupOrder.shareCode}
          eventName={currentGroupOrder.name}
          deliveryDate={currentGroupOrder.deliveryDate}
          participantCount={currentGroupOrder.participants.length}
          totalAmount={currentGroupOrder.totalAmount || 0}
          onSuccess={() => {
            refreshGroupOrder()
            fetchPaymentStatus()
          }}
        />
      )}

      {/* Host Decision Modal */}
      {showHostDecisionModal && currentGroupOrder && paymentStatus && (
        <HostDecisionModal
          isOpen={showHostDecisionModal}
          onClose={() => setShowHostDecisionModal(false)}
          shareCode={currentGroupOrder.shareCode}
          groupOrderName={currentGroupOrder.name}
          paidParticipants={paymentStatus.payments
            .filter(p => p.status === 'PAID')
            .map(p => ({ participantName: p.participantName, amount: p.amount, status: 'PAID' as const }))}
          unpaidParticipants={paymentStatus.payments
            .filter(p => p.status !== 'PAID')
            .map(p => ({ participantName: p.participantName, amount: p.amount, status: 'PENDING' as const }))}
          totalPaid={paymentStatus.payment.totalPaid}
          totalPending={paymentStatus.payment.totalPending}
          onDecisionMade={() => {
            refreshGroupOrder()
            fetchPaymentStatus()
          }}
        />
      )}
    </div>
  )
}