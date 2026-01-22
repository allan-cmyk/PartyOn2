'use client'

import { type ReactElement } from 'react'
import { type GroupPaymentStatus } from '@/lib/group-orders/types'
import PaymentDeadlineTimer from './PaymentDeadlineTimer'
import PaymentStatusCard from './PaymentStatusCard'

interface PaymentStatusSectionProps {
  paymentStatus: GroupPaymentStatus
  onHostDecisionNeeded: () => void
  shareCode: string
}

export default function PaymentStatusSection({
  paymentStatus,
  onHostDecisionNeeded,
}: PaymentStatusSectionProps): ReactElement {
  const { payment, participants, payments, deadline } = paymentStatus

  const paymentPercentage = payment.totalExpected > 0
    ? Math.round((payment.totalPaid / payment.totalExpected) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-cormorant text-gray-900">Payment Status</h2>
        {deadline.needsHostDecision && (
          <button
            onClick={onHostDecisionNeeded}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors animate-pulse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            ACTION REQUIRED
          </button>
        )}
      </div>

      {/* Payment Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">
            ${payment.totalPaid.toFixed(2)} of ${payment.totalExpected.toFixed(2)} collected
          </span>
          <span className="text-sm font-medium text-gray-900">{paymentPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all ${
              payment.isFullyPaid
                ? 'bg-green-500'
                : payment.meetsMinimum
                ? 'bg-gold-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
          />
        </div>
        {payment.isFullyPaid && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            All payments received!
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{participants.paid}</p>
          <p className="text-xs text-gray-600 tracking-[0.1em]">PAID</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <p className="text-2xl font-bold text-amber-600">{participants.pending}</p>
          <p className="text-xs text-gray-600 tracking-[0.1em]">PENDING</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{participants.failed}</p>
          <p className="text-xs text-gray-600 tracking-[0.1em]">FAILED</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-700">{participants.total}</p>
          <p className="text-xs text-gray-600 tracking-[0.1em]">TOTAL</p>
        </div>
      </div>

      {/* Deadline Timer */}
      {deadline.deadline && (
        <div className="mb-6">
          <PaymentDeadlineTimer
            deadline={deadline.deadline}
            onExpired={onHostDecisionNeeded}
          />
        </div>
      )}

      {/* Individual Payments List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 tracking-[0.1em]">
          PARTICIPANT PAYMENTS
        </h3>
        <div className="space-y-2">
          {payments.map((payment) => (
            <PaymentStatusCard
              key={payment.participantId}
              participantName={payment.participantName}
              amount={payment.amount}
              status={payment.status}
              paidAt={payment.paidAt}
              isCurrentUser={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
