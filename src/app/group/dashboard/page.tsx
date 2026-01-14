'use client'

import { useEffect, useState, useCallback, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { useCartContext } from '@/contexts/CartContext'
import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder'
import PaymentStatusCard from '@/components/group-orders/PaymentStatusCard'
import PaymentDeadlineTimer from '@/components/group-orders/PaymentDeadlineTimer'
import HostDecisionModal from '@/components/group-orders/HostDecisionModal'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/track'
import type { PaymentStatus } from '@/lib/group-orders/types'

interface PaymentStatusData {
  groupOrder: {
    paymentDeadline: string | null
    multiPaymentEnabled: boolean
    totalPaid: number
    totalPending: number
  }
  payments: Array<{
    participantId: string
    participantName: string
    participantEmail?: string
    amount: number
    status: PaymentStatus
    paidAt?: string | null
  }>
  summary: {
    totalParticipants: number
    paidCount: number
    pendingCount: number
    totalPaid: number
    totalPending: number
  }
}

export default function GroupOrderDashboard(): ReactElement {
  const router = useRouter()
  const { currentGroupOrder, isHost, isInGroupOrder, refreshGroupOrder } = useGroupOrderContext()
  const { cart } = useCartContext()
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [isEnablingMultiPay, setIsEnablingMultiPay] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentStatusData | null>(null)
  const [deadlineInput, setDeadlineInput] = useState('')

  // Redirect if not in a group order or not the host
  useEffect(() => {
    if (!isInGroupOrder) {
      router.push('/products')
    } else if (!isHost) {
      router.push('/products')
    }
  }, [isInGroupOrder, isHost, router])

  // Fetch payment status data
  const fetchPaymentStatus = useCallback(async (): Promise<void> => {
    if (!currentGroupOrder?.multiPaymentEnabled) return

    try {
      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/payment-status`)
      const data = await response.json()
      if (data.success) {
        setPaymentData(data.data)
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)
    }
  }, [currentGroupOrder?.shareCode, currentGroupOrder?.multiPaymentEnabled])

  // Refresh group order data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGroupOrder()
      fetchPaymentStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [refreshGroupOrder, fetchPaymentStatus])

  // Initial payment status fetch
  useEffect(() => {
    fetchPaymentStatus()
  }, [fetchPaymentStatus])

  const handleLockOrder = async (): Promise<void> => {
    if (!currentGroupOrder) return

    const customerId = localStorage.getItem('customerId')
    if (!customerId) {
      alert('Please log in to continue')
      return
    }

    setIsLocking(true)
    try {
      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/lock-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostCustomerId: customerId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lock order')
      }

      trackEvent(ANALYTICS_EVENTS.LOCK_GROUP_ORDER, {
        group_order_id: currentGroupOrder.id,
        participant_count: currentGroupOrder.participants.length,
        total_amount: currentGroupOrder.totalAmount || 0
      })

      router.push(data.checkoutUrl)
    } catch (error) {
      console.error('Error locking order:', error)
      alert(error instanceof Error ? error.message : 'Failed to lock order. Please try again.')
    } finally {
      setIsLocking(false)
    }
  }

  const handleEnableMultiPayment = async (): Promise<void> => {
    if (!currentGroupOrder || !deadlineInput) return

    const customerId = localStorage.getItem('customerId')
    if (!customerId) {
      alert('Please log in to continue')
      return
    }

    setIsEnablingMultiPay(true)
    try {
      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/enable-multi-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostCustomerId: customerId,
          paymentDeadline: new Date(deadlineInput).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable multi-payment')
      }

      refreshGroupOrder()
      fetchPaymentStatus()
    } catch (error) {
      console.error('Error enabling multi-payment:', error)
      alert(error instanceof Error ? error.message : 'Failed to enable multi-payment.')
    } finally {
      setIsEnablingMultiPay(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string): Promise<void> => {
    if (!confirm('Are you sure you want to remove this participant?')) return

    try {
      const customerId = localStorage.getItem('customerId')
      if (!customerId || !currentGroupOrder) return

      const response = await fetch(`/api/group-orders/${currentGroupOrder.shareCode}/remove-participant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, hostCustomerId: customerId }),
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

  const handleDeadlineExpired = (): void => {
    // Check if there are unpaid participants
    if (paymentData && paymentData.summary.pendingCount > 0) {
      setShowDecisionModal(true)
    }
  }

  const handleDecisionMade = (): void => {
    refreshGroupOrder()
    fetchPaymentStatus()
  }

  if (!currentGroupOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  const totalAmount = currentGroupOrder.participants.reduce((sum, p) => sum + (p.cartTotal || 0), 0)
  const totalItems = currentGroupOrder.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
  const minimumMet = totalAmount >= currentGroupOrder.minimumOrderAmount
  const isMultiPaymentMode = currentGroupOrder.multiPaymentEnabled

  // Get payment info for each participant
  const getParticipantPayment = (participantId: string) => {
    return paymentData?.payments.find(p => p.participantId === participantId)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto fade-in-up">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-cormorant text-gray-900 mb-2">
                  {currentGroupOrder.name}
                </h1>
                <p className="text-gray-600">
                  Share Code: <span className="font-mono font-bold">{currentGroupOrder.shareCode}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 border border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900 transition-colors tracking-[0.1em]"
                >
                  SHARE
                </button>
                {!isMultiPaymentMode && (
                  <button
                    onClick={handleLockOrder}
                    disabled={!minimumMet || isLocking || currentGroupOrder.status !== 'active'}
                    className={`px-6 py-2 tracking-[0.1em] transition-colors ${
                      minimumMet && !isLocking
                        ? 'bg-gold-600 text-gray-900 hover:bg-gold-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLocking ? 'LOCKING...' : 'LOCK & CHECKOUT'}
                  </button>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">DELIVERY DATE</p>
                <p className="font-medium">
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
                <p className="font-medium">{currentGroupOrder.deliveryTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 tracking-[0.1em]">DELIVERY ADDRESS</p>
                <p className="font-medium">
                  {currentGroupOrder.deliveryAddress.address1}
                  {currentGroupOrder.deliveryAddress.address2 && `, ${currentGroupOrder.deliveryAddress.address2}`}
                  <br />
                  {currentGroupOrder.deliveryAddress.city}, {currentGroupOrder.deliveryAddress.province} {currentGroupOrder.deliveryAddress.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Deadline Timer - Only show in multi-payment mode */}
          {isMultiPaymentMode && currentGroupOrder.paymentDeadline && (
            <PaymentDeadlineTimer
              deadline={currentGroupOrder.paymentDeadline}
              onExpired={handleDeadlineExpired}
              className="mb-6"
            />
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-cormorant mb-4">Order Summary</h2>

            {isMultiPaymentMode && paymentData ? (
              // Multi-payment summary
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-600">
                    {currentGroupOrder.participants.length}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">PARTICIPANTS</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ${paymentData.summary.totalPaid.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">PAID ({paymentData.summary.paidCount})</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">
                    ${paymentData.summary.totalPending.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">PENDING ({paymentData.summary.pendingCount})</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-600">
                    {totalItems}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">TOTAL ITEMS</p>
                </div>
              </div>
            ) : (
              // Traditional summary
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-600">
                    {currentGroupOrder.participants.length}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">PARTICIPANTS</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-600">
                    {totalItems}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">TOTAL ITEMS</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gold-600">
                    ${totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 tracking-[0.1em]">TOTAL AMOUNT</p>
                </div>
              </div>
            )}

            {/* Minimum Order Progress - Only show in traditional mode */}
            {!isMultiPaymentMode && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Minimum Order Progress</span>
                  <span className="text-sm font-medium">
                    ${totalAmount.toFixed(2)} / ${currentGroupOrder.minimumOrderAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      minimumMet ? 'bg-green-500' : 'bg-gold-600'
                    }`}
                    style={{
                      width: `${Math.min((totalAmount / currentGroupOrder.minimumOrderAmount) * 100, 100)}%`
                    }}
                  />
                </div>
                {!minimumMet && (
                  <p className="text-sm text-amber-600 mt-2">
                    ${(currentGroupOrder.minimumOrderAmount - totalAmount).toFixed(2)} more needed to meet minimum
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Enable Multi-Payment Section - Only show if not already enabled */}
          {!isMultiPaymentMode && minimumMet && currentGroupOrder.status === 'active' && (
            <div className="bg-gradient-to-r from-gold-50 to-amber-50 border border-gold-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">Enable Split Payment</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Let each participant pay for their own items directly. Set a deadline by which everyone must complete payment.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Payment Deadline</label>
                      <input
                        type="datetime-local"
                        value={deadlineInput}
                        onChange={(e) => setDeadlineInput(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleEnableMultiPayment}
                        disabled={!deadlineInput || isEnablingMultiPay}
                        className="px-6 py-2 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnablingMultiPay ? 'ENABLING...' : 'ENABLE SPLIT PAYMENT'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participants List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-cormorant mb-4">
              {isMultiPaymentMode ? 'Participants & Payment Status' : 'Participants & Carts'}
            </h2>

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
            ) : isMultiPaymentMode ? (
              // Multi-payment participant cards
              <div className="space-y-3">
                {currentGroupOrder.participants.map((participant) => {
                  const payment = getParticipantPayment(participant.id)
                  return (
                    <PaymentStatusCard
                      key={participant.id}
                      participantName={participant.guestName || 'Anonymous Guest'}
                      participantEmail={participant.guestEmail}
                      amount={payment?.amount || participant.cartTotal || 0}
                      status={payment?.status || 'PENDING'}
                      paidAt={payment?.paidAt}
                      isCurrentUser={participant.cartId === cart?.id}
                      canRemove={isHost && participant.cartId !== cart?.id}
                      onRemove={() => handleRemoveParticipant(participant.id)}
                    />
                  )
                })}
              </div>
            ) : (
              // Traditional participant list
              <div className="space-y-4">
                {currentGroupOrder.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">
                              {participant.guestName || 'Anonymous Guest'}
                              {participant.cartId === cart?.id && (
                                <span className="ml-2 text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded">YOU</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Joined {new Date(participant.joinedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium">
                            ${(participant.cartTotal || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {participant.itemCount || 0} items
                          </p>
                        </div>

                        {isHost && participant.cartId !== cart?.id && (
                          <button
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-red-600 hover:text-red-700 p-2"
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
                CONTINUE SHOPPING
              </button>
            </Link>
            {!isMultiPaymentMode && minimumMet && (
              <button
                onClick={handleLockOrder}
                disabled={isLocking}
                className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em]"
              >
                {isLocking ? 'PREPARING CHECKOUT...' : 'PROCEED TO CHECKOUT'}
              </button>
            )}
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

      {/* Host Decision Modal */}
      {showDecisionModal && paymentData && (
        <HostDecisionModal
          isOpen={showDecisionModal}
          onClose={() => setShowDecisionModal(false)}
          shareCode={currentGroupOrder.shareCode}
          groupOrderName={currentGroupOrder.name}
          paidParticipants={paymentData.payments
            .filter(p => p.status === 'PAID')
            .map(p => ({
              participantName: p.participantName,
              amount: p.amount,
              status: 'PAID' as const,
            }))}
          unpaidParticipants={paymentData.payments
            .filter(p => p.status !== 'PAID')
            .map(p => ({
              participantName: p.participantName,
              amount: p.amount,
              status: p.status === 'EXPIRED' ? 'EXPIRED' as const : 'PENDING' as const,
            }))}
          totalPaid={paymentData.summary.totalPaid}
          totalPending={paymentData.summary.totalPending}
          onDecisionMade={handleDecisionMade}
        />
      )}
    </div>
  )
}
