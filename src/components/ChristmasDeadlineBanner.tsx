'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ChristmasDeadlineBannerProps {
  deadline?: string
  minOrderAmount?: number
  dismissible?: boolean
}

export default function ChristmasDeadlineBanner({
  deadline = 'December 20',
  minOrderAmount = 100,
  dismissible = true
}: ChristmasDeadlineBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white sticky top-0 z-50 shadow-lg overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 hidden sm:block">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <p className="text-sm sm:text-base font-semibold tracking-wide">
              🎄 Order by{' '}
              <span className="font-bold underline decoration-2 underline-offset-2">
                {deadline}
              </span>{' '}
              for Christmas Delivery
            </p>
            <span className="hidden sm:inline text-white/70">|</span>
            <p className="text-xs sm:text-sm font-medium tracking-wide">
              Free Delivery on Orders ${minOrderAmount}+
            </p>
          </div>

          {/* Dismiss Button */}
          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
