'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerContext } from '@/contexts/CustomerContext'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import CustomerAuth from '@/components/CustomerAuth'
import AccountLayout from '@/components/account/AccountLayout'
import ShareGroupOrder from '@/components/group-orders/ShareGroupOrder'

interface GroupOrderSummary {
  id: string
  name: string
  shareCode: string
  status: string
  deliveryDate: string
  deliveryTime: string
  createdAt: string
  participantCount: number
  checkedOutCount: number
  totalItems: number
}

export default function GroupOrdersPage() {
  const router = useRouter()
  const { customer, isAuthenticated, loading: authLoading } = useCustomerContext()
  const { setGroupOrderCode } = useGroupOrderContext()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [orders, setOrders] = useState<GroupOrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOrder, setShareModalOrder] = useState<GroupOrderSummary | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsAuthOpen(true)
    }
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    async function fetchOrders() {
      if (!customer?.id) return

      try {
        setLoading(true)
        const response = await fetch(`/api/group-orders/my-orders?customerId=${customer.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders')
        }

        setOrders(data.orders)
      } catch (err) {
        console.error('Error fetching group orders:', err)
        setError(err instanceof Error ? err.message : 'Failed to load group orders')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && customer?.id) {
      fetchOrders()
    }
  }, [isAuthenticated, customer?.id])

  const handleViewDashboard = (order: GroupOrderSummary) => {
    setGroupOrderCode(order.shareCode)
    router.push('/group/dashboard')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
      case 'closed':
      case 'locked':
        return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Closed</span>
      case 'completed':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Completed</span>
      case 'cancelled':
        return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Cancelled</span>
      default:
        return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{status}</span>
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <CustomerAuth
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          redirectTo="/account/group-orders"
        />
        <div className="text-center px-4">
          <h2 className="text-3xl font-cormorant mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to view your group orders</p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em]"
          >
            SIGN IN TO CONTINUE
          </button>
        </div>
      </div>
    )
  }

  return (
    <AccountLayout title="Group Orders">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12">
          <div className="text-center max-w-md mx-auto">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-cormorant text-gray-900 mb-2">No Group Orders Yet</h3>
            <p className="text-gray-600 mb-6">Create a group order to share with friends and family</p>
            <Link
              href="/group/create"
              className="inline-block px-8 py-3 bg-gold-600 text-gray-900 text-sm tracking-[0.1em] hover:bg-gold-700 transition-colors rounded"
            >
              CREATE GROUP ORDER
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-gold-600">{orders.length}</p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">TOTAL GROUPS</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {orders.filter(o => o.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">ACTIVE</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">
                {orders.reduce((sum, o) => sum + o.participantCount, 0)}
              </p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">TOTAL PARTICIPANTS</p>
            </div>
          </div>

          {/* Orders List */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-cormorant text-gray-900">{order.name}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Code: <span className="font-mono font-medium">{order.shareCode}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(order.deliveryDate)} at {order.deliveryTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {order.participantCount} participant{order.participantCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Checkout Progress */}
                  {order.participantCount > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                          <div
                            className="h-2 rounded-full bg-green-500 transition-all"
                            style={{
                              width: `${(order.checkedOutCount / order.participantCount) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {order.checkedOutCount}/{order.participantCount} checked out
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewDashboard(order)}
                    className="px-4 py-2 bg-gold-600 text-gray-900 text-xs tracking-[0.1em] hover:bg-gold-700 transition-colors"
                  >
                    DASHBOARD
                  </button>
                  <button
                    onClick={() => setShareModalOrder(order)}
                    className="px-4 py-2 border border-gold-600 text-gray-900 text-xs tracking-[0.1em] hover:bg-gold-50 transition-colors"
                  >
                    SHARE
                  </button>
                  <Link
                    href={`/group/${order.shareCode}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs tracking-[0.1em] hover:bg-gray-50 transition-colors"
                  >
                    VIEW PAGE
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Button */}
          <div className="text-center pt-4">
            <Link
              href="/group/create"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:border-gold-600 hover:text-gold-600 transition-colors rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Group Order
            </Link>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOrder && (
        <ShareGroupOrder
          isOpen={!!shareModalOrder}
          onClose={() => setShareModalOrder(null)}
          shareCode={shareModalOrder.shareCode}
          eventName={shareModalOrder.name}
        />
      )}
    </AccountLayout>
  )
}
