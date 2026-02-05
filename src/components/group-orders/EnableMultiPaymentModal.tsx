'use client'

import { useState, type ReactElement } from 'react'

interface EnableMultiPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  shareCode: string
  eventName: string
  deliveryDate: string
  participantCount: number
  totalAmount: number
  onSuccess: () => void
}

export default function EnableMultiPaymentModal({
  isOpen,
  onClose,
  shareCode,
  eventName,
  deliveryDate,
  participantCount,
  totalAmount,
  onSuccess,
}: EnableMultiPaymentModalProps): ReactElement | null {
  const [deadline, setDeadline] = useState(() => {
    // Default: 24 hours before delivery
    const deliveryDateTime = new Date(deliveryDate)
    deliveryDateTime.setHours(deliveryDateTime.getHours() - 24)
    return deliveryDateTime.toISOString().slice(0, 16)
  })
  const [isEnabling, setIsEnabling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const getMinDeadline = (): string => {
    // Min: 1 hour from now
    const minDate = new Date()
    minDate.setHours(minDate.getHours() + 1)
    return minDate.toISOString().slice(0, 16)
  }

  const getMaxDeadline = (): string => {
    // Max: delivery date
    return new Date(deliveryDate).toISOString().slice(0, 16)
  }

  const handleEnable = async (): Promise<void> => {
    if (!deadline) {
      setError('Please select a payment deadline')
      return
    }

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const deliveryDateTime = new Date(deliveryDate)

    if (deadlineDate <= now) {
      setError('Deadline must be in the future')
      return
    }

    if (deadlineDate > deliveryDateTime) {
      setError('Deadline cannot be after delivery date')
      return
    }

    setIsEnabling(true)
    setError(null)

    try {
      const customerId = localStorage.getItem('customerId')
      if (!customerId) {
        throw new Error('Please log in to continue')
      }

      const response = await fetch(`/api/group-orders/${shareCode}/enable-multi-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostCustomerId: customerId,
          paymentDeadline: new Date(deadline).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable split payments')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsEnabling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-cormorant mb-2">Enable Split Pay</h2>
            <p className="text-gray-600">{eventName}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-yellow">{participantCount}</p>
                <p className="text-sm text-gray-500">Participants</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">How Split Pay Works:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Each participant pays for their own items
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Delivery fee is split equally among all participants
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Participants receive a payment link via email
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Track payment status in real-time on your dashboard
              </li>
            </ul>
          </div>

          {/* Deadline Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={getMinDeadline()}
              max={getMaxDeadline()}
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Participants must complete payment by this time
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isEnabling}
              className="flex-1 px-4 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors tracking-[0.1em]"
            >
              CANCEL
            </button>
            <button
              onClick={handleEnable}
              disabled={isEnabling}
              className="flex-1 px-4 py-3 bg-brand-yellow text-gray-900 rounded hover:bg-yellow-600 transition-colors tracking-[0.1em] disabled:opacity-50"
            >
              {isEnabling ? 'ENABLING...' : 'ENABLE SPLIT PAY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
