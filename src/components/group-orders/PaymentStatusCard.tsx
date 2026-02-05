'use client'

import { type ReactElement } from 'react'

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'EXPIRED' | 'CANCELLED'

interface PaymentStatusCardProps {
  participantName: string
  participantEmail?: string
  amount: number
  status: PaymentStatus
  paidAt?: string | null
  isCurrentUser?: boolean
  onRemove?: () => void
  canRemove?: boolean
}

const statusConfig: Record<PaymentStatus, {
  label: string
  bgColor: string
  textColor: string
  icon: ReactElement
}> = {
  PENDING: {
    label: 'Awaiting Payment',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  PROCESSING: {
    label: 'Processing',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  PAID: {
    label: 'Paid',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  FAILED: {
    label: 'Payment Failed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  REFUNDED: {
    label: 'Refunded',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  PARTIALLY_REFUNDED: {
    label: 'Partial Refund',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  EXPIRED: {
    label: 'Expired',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
}

export default function PaymentStatusCard({
  participantName,
  participantEmail,
  amount,
  status,
  paidAt,
  isCurrentUser = false,
  onRemove,
  canRemove = false,
}: PaymentStatusCardProps): ReactElement {
  const config = statusConfig[status]

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      status === 'PAID' ? 'border-green-200 bg-green-50/50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            status === 'PAID' ? 'bg-green-200' : 'bg-yellow-100'
          }`}>
            {status === 'PAID' ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>

          {/* Name & Email */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {participantName || 'Anonymous'}
              </p>
              {isCurrentUser && (
                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded flex-shrink-0">
                  YOU
                </span>
              )}
            </div>
            {participantEmail && (
              <p className="text-sm text-gray-500 truncate">{participantEmail}</p>
            )}
          </div>
        </div>

        {/* Amount & Status */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className={`font-semibold ${status === 'PAID' ? 'text-green-600' : 'text-gray-900'}`}>
              ${amount.toFixed(2)}
            </p>
            {paidAt && status === 'PAID' && (
              <p className="text-xs text-gray-500">
                {new Date(paidAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
            {config.icon}
            <span className="text-xs font-medium tracking-wide">{config.label}</span>
          </div>

          {/* Remove Button */}
          {canRemove && onRemove && !isCurrentUser && status !== 'PAID' && (
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
              title="Remove participant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
