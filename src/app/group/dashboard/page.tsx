'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { useCartContext } from '@/contexts/CartContext'
// import { formatPrice } from '@/lib/shopify/utils' // Not used currently
import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder'

export default function GroupOrderDashboard() {
  const router = useRouter()
  const { currentGroupOrder, isHost, isInGroupOrder, refreshGroupOrder } = useGroupOrderContext()
  const { cart } = useCartContext()
  const [showShareModal, setShowShareModal] = useState(false)
  const [isLocking, setIsLocking] = useState(false)

  // Redirect if not in a group order or not the host
  useEffect(() => {
    if (!isInGroupOrder) {
      router.push('/products')
    } else if (!isHost) {
      router.push('/products')
    }
  }, [isInGroupOrder, isHost, router])

  // Refresh group order data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGroupOrder()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [refreshGroupOrder])

  const handleLockOrder = async () => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostCustomerId: customerId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to lock order')
      }
      
      // Redirect to checkout
      router.push(data.checkoutUrl)
    } catch (error) {
      console.error('Error locking order:', error)
      alert(error instanceof Error ? error.message : 'Failed to lock order. Please try again.')
    } finally {
      setIsLocking(false)
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

  const totalAmount = currentGroupOrder.participants.reduce((sum, p) => sum + (p.cartTotal || 0), 0)
  const totalItems = currentGroupOrder.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
  const minimumMet = totalAmount >= currentGroupOrder.minimumOrderAmount

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

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-cormorant mb-4">Order Summary</h2>
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

            {/* Minimum Order Progress */}
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
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-cormorant mb-4">Participants & Carts</h2>
            
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

                    {/* Show cart items if available (future enhancement) */}
                    {/* {participant.items && participant.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-2">Cart Items:</p>
                        <div className="space-y-1">
                          {participant.items.map((item, index) => (
                            <div key={index} className="text-sm flex justify-between">
                              <span>{item.title} x {item.quantity}</span>
                              <span>${item.total}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )} */}
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
            {minimumMet && (
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
    </div>
  )
}