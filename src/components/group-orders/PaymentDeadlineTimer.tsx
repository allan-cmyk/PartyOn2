'use client'

import { useState, useEffect, type ReactElement } from 'react'

interface PaymentDeadlineTimerProps {
  deadline: Date | string
  onExpired?: () => void
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export default function PaymentDeadlineTimer({
  deadline,
  onExpired,
  className = '',
}: PaymentDeadlineTimerProps): ReactElement {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
      const now = new Date()
      const total = deadlineDate.getTime() - now.getTime()

      if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
      }

      return {
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((total % (1000 * 60)) / 1000),
        total,
      }
    }

    const updateTimer = (): void => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      if (remaining.total <= 0 && !isExpired) {
        setIsExpired(true)
        onExpired?.()
      }
    }

    // Initial calculation
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [deadline, isExpired, onExpired])

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0')
  }

  const getUrgencyClass = (): string => {
    if (isExpired) return 'bg-red-100 border-red-300 text-red-700'
    if (timeRemaining.total < 3600000) return 'bg-red-50 border-red-200 text-red-600' // < 1 hour
    if (timeRemaining.total < 21600000) return 'bg-amber-50 border-amber-200 text-amber-600' // < 6 hours
    if (timeRemaining.total < 86400000) return 'bg-yellow-50 border-yellow-200 text-yellow-600' // < 24 hours
    return 'bg-gray-50 border-gray-200 text-gray-600'
  }

  if (isExpired) {
    return (
      <div className={`flex items-center justify-center p-3 rounded-lg border ${getUrgencyClass()} ${className}`}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium tracking-[0.1em]">DEADLINE PASSED</span>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg border ${getUrgencyClass()} ${className}`}>
      <div className="text-center">
        <p className="text-xs tracking-[0.15em] mb-2 opacity-75">PAYMENT DEADLINE</p>
        <div className="flex items-center justify-center gap-2">
          {timeRemaining.days > 0 && (
            <>
              <div className="text-center">
                <span className="text-2xl font-bold font-mono">{timeRemaining.days}</span>
                <p className="text-xs uppercase tracking-wide">days</p>
              </div>
              <span className="text-2xl font-light opacity-50">:</span>
            </>
          )}
          <div className="text-center">
            <span className="text-2xl font-bold font-mono">{formatNumber(timeRemaining.hours)}</span>
            <p className="text-xs uppercase tracking-wide">hrs</p>
          </div>
          <span className="text-2xl font-light opacity-50">:</span>
          <div className="text-center">
            <span className="text-2xl font-bold font-mono">{formatNumber(timeRemaining.minutes)}</span>
            <p className="text-xs uppercase tracking-wide">min</p>
          </div>
          <span className="text-2xl font-light opacity-50">:</span>
          <div className="text-center">
            <span className="text-2xl font-bold font-mono">{formatNumber(timeRemaining.seconds)}</span>
            <p className="text-xs uppercase tracking-wide">sec</p>
          </div>
        </div>

        {/* Urgency Message */}
        {timeRemaining.total < 3600000 && (
          <p className="text-xs mt-2 animate-pulse">⚠️ Less than 1 hour remaining!</p>
        )}
        {timeRemaining.total >= 3600000 && timeRemaining.total < 21600000 && (
          <p className="text-xs mt-2">⏰ Less than 6 hours remaining</p>
        )}
      </div>
    </div>
  )
}
