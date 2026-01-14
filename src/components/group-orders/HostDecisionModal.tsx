'use client'

import { useState, type ReactElement } from 'react'

interface PaymentInfo {
  participantName: string
  amount: number
  status: 'PAID' | 'PENDING' | 'EXPIRED' | 'FAILED'
}

interface HostDecisionModalProps {
  isOpen: boolean
  onClose: () => void
  shareCode: string
  groupOrderName: string
  paidParticipants: PaymentInfo[]
  unpaidParticipants: PaymentInfo[]
  totalPaid: number
  totalPending: number
  onDecisionMade: () => void
}

type Decision = 'PROCEED_PARTIAL' | 'CANCEL_REFUND_ALL' | 'EXTEND_DEADLINE'

export default function HostDecisionModal({
  isOpen,
  onClose,
  shareCode,
  groupOrderName,
  paidParticipants,
  unpaidParticipants,
  totalPaid,
  totalPending,
  onDecisionMade,
}: HostDecisionModalProps): ReactElement | null {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)
  const [newDeadline, setNewDeadline] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'confirm'>('select')

  if (!isOpen) return null

  const handleDecisionSelect = (decision: Decision): void => {
    setSelectedDecision(decision)
    setError(null)

    if (decision === 'EXTEND_DEADLINE') {
      // Set default new deadline to tomorrow at noon
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(12, 0, 0, 0)
      setNewDeadline(tomorrow.toISOString().slice(0, 16))
    }

    setStep('confirm')
  }

  const handleConfirm = async (): Promise<void> => {
    if (!selectedDecision) return

    setIsProcessing(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        decision: selectedDecision,
        hostCustomerId: localStorage.getItem('customerId'),
      }

      if (selectedDecision === 'EXTEND_DEADLINE') {
        if (!newDeadline) {
          throw new Error('Please select a new deadline')
        }
        body.newDeadline = new Date(newDeadline).toISOString()
      }

      const response = await fetch(`/api/group-orders/${shareCode}/host-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process decision')
      }

      onDecisionMade()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = (): void => {
    setStep('select')
    setError(null)
  }

  const getDecisionDetails = (): {
    title: string
    description: string
    warning: string
    buttonText: string
    buttonClass: string
  } => {
    switch (selectedDecision) {
      case 'PROCEED_PARTIAL':
        return {
          title: 'Proceed with Paid Participants',
          description: `The order will proceed with ${paidParticipants.length} participant(s) who have paid ($${totalPaid.toFixed(2)} total). Items from unpaid participants will be removed.`,
          warning: `${unpaidParticipants.length} participant(s) will be removed from the order.`,
          buttonText: 'PROCEED WITH ORDER',
          buttonClass: 'bg-green-600 hover:bg-green-700',
        }
      case 'CANCEL_REFUND_ALL':
        return {
          title: 'Cancel & Refund Everyone',
          description: `The entire group order will be cancelled. ${paidParticipants.length} participant(s) who paid will receive full refunds.`,
          warning: 'This action cannot be undone. All participants will be notified.',
          buttonText: 'CANCEL & REFUND ALL',
          buttonClass: 'bg-red-600 hover:bg-red-700',
        }
      case 'EXTEND_DEADLINE':
        return {
          title: 'Extend Payment Deadline',
          description: `Give ${unpaidParticipants.length} participant(s) more time to complete their payments.`,
          warning: 'Participants will be notified of the new deadline.',
          buttonText: 'EXTEND DEADLINE',
          buttonClass: 'bg-gold-600 hover:bg-gold-700',
        }
      default:
        return {
          title: '',
          description: '',
          warning: '',
          buttonText: '',
          buttonClass: '',
        }
    }
  }

  const details = getDecisionDetails()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {step === 'select' ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-cormorant mb-2">Payment Deadline Passed</h2>
                <p className="text-gray-600">{groupOrderName}</p>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{paidParticipants.length} Paid</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">${totalPending.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{unpaidParticipants.length} Unpaid</p>
                  </div>
                </div>
              </div>

              {/* Decision Options */}
              <div className="space-y-3">
                <button
                  onClick={() => handleDecisionSelect('PROCEED_PARTIAL')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-green-200">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Proceed with Paid Participants</p>
                      <p className="text-sm text-gray-500">Ship items for those who paid</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDecisionSelect('EXTEND_DEADLINE')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all text-left group"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-gold-200">
                      <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Extend Deadline</p>
                      <p className="text-sm text-gray-500">Give more time for payments</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDecisionSelect('CANCEL_REFUND_ALL')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-red-200">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Cancel & Refund All</p>
                      <p className="text-sm text-gray-500">Cancel order and refund everyone</p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-cormorant mb-2">{details.title}</h2>
                <p className="text-gray-600">{details.description}</p>
              </div>

              {/* Extended Deadline Date Picker */}
              {selectedDecision === 'EXTEND_DEADLINE' && (
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">New Deadline</label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
              )}

              {/* Affected Participants */}
              {selectedDecision === 'PROCEED_PARTIAL' && unpaidParticipants.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">These participants will be removed:</p>
                  <div className="bg-red-50 rounded p-3 space-y-1">
                    {unpaidParticipants.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{p.participantName}</span>
                        <span className="text-red-600">${p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDecision === 'CANCEL_REFUND_ALL' && paidParticipants.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">These participants will be refunded:</p>
                  <div className="bg-green-50 rounded p-3 space-y-1">
                    {paidParticipants.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{p.participantName}</span>
                        <span className="text-green-600">+${p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-amber-700">{details.warning}</p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors tracking-[0.1em]"
                >
                  BACK
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-3 text-white rounded transition-colors tracking-[0.1em] ${details.buttonClass} disabled:opacity-50`}
                >
                  {isProcessing ? 'PROCESSING...' : details.buttonText}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
