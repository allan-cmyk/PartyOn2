'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PaymentDetails {
  groupOrderName: string
  participantName: string
  amount: number
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: {
    address1: string
    city: string
    province: string
    zip: string
  }
}

export default function GroupPaymentSuccessPage(): React.ReactElement {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const groupCode = searchParams.get('group')

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentDetails = async (): Promise<void> => {
      if (!groupCode) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/group-orders/${groupCode}/payment-status`)
        const data = await response.json()

        if (data.success) {
          setPaymentDetails({
            groupOrderName: data.data.groupOrder.name,
            participantName: 'Your payment',
            amount: data.data.payment.totalPaid,
            deliveryDate: data.data.groupOrder.deliveryDate,
            deliveryTime: data.data.groupOrder.deliveryTime,
            deliveryAddress: {
              address1: '',
              city: '',
              province: '',
              zip: '',
            },
          })
        }
      } catch (err) {
        console.error('Error fetching payment details:', err)
        setError('Could not load payment details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [groupCode])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600 tracking-[0.1em]">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-200 rounded-full animate-ping-once opacity-50"></div>
            </div>
            <h1 className="text-3xl font-cormorant tracking-[0.1em] mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your contribution to the group order has been received.
            </p>
          </div>

          {/* Payment Confirmation Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            {error ? (
              <p className="text-gray-600 text-center py-4">{error}</p>
            ) : (
              <>
                {/* Confirmation Details */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 tracking-[0.1em]">SESSION ID</span>
                    <span className="font-mono text-sm text-gray-600">
                      {sessionId?.slice(0, 20)}...
                    </span>
                  </div>
                </div>

                {paymentDetails && (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group Order</span>
                        <span className="font-medium">{paymentDetails.groupOrderName}</span>
                      </div>
                      {paymentDetails.deliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Date</span>
                          <span className="font-medium">
                            {new Date(paymentDetails.deliveryDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {paymentDetails.deliveryTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Time</span>
                          <span className="font-medium">{paymentDetails.deliveryTime}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-green-800">Payment Confirmed</p>
                          <p className="text-sm text-green-600 mt-1">
                            Your items will be delivered with the group order on the scheduled date.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* What Happens Next */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">1</span>
                      <span>You&apos;ll receive a confirmation email shortly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">2</span>
                      <span>The host will finalize the group order</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">3</span>
                      <span>All items will be delivered together on the scheduled date</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {groupCode && (
              <Link href={`/group/${groupCode}`} className="flex-1">
                <button className="w-full px-6 py-3 border border-gray-300 hover:border-gold-500 transition-colors tracking-[0.1em]">
                  VIEW GROUP ORDER
                </button>
              </Link>
            )}
            <Link href="/products" className="flex-1">
              <button className="w-full px-6 py-3 bg-gold-500 text-gray-900 hover:bg-gold-600 transition-colors tracking-[0.1em]">
                CONTINUE SHOPPING
              </button>
            </Link>
          </div>

          {/* Support Info */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Questions? Contact us at{' '}
            <a href="mailto:support@partyondelivery.com" className="text-gold-600 hover:underline">
              support@partyondelivery.com
            </a>
          </p>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ping-once {
          0% { transform: translate(-50%, 0) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, 0) scale(1.5); opacity: 0; }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
