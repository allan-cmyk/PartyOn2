'use client'

import { useState, type ReactElement, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import Footer from '@/components/Footer'

/**
 * Join Group Order Landing Page
 * Allows users to enter a share code to join an existing group order
 */
export default function JoinGroupOrderPage(): ReactElement {
  const router = useRouter()
  const [shareCode, setShareCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedCode = shareCode.trim()
    if (!trimmedCode) {
      setError('Please enter a share code')
      return
    }

    setIsLoading(true)

    try {
      // Clean up the code - remove spaces, make URL-safe
      const urlSafeCode = trimmedCode.replace(/\s+/g, '-')

      // Navigate to the group order page
      router.push(`/group/${encodeURIComponent(urlSafeCode)}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OldFashionedNavigation />

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gold-600 mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-cormorant text-gray-900 mb-2">
                  Join a Group Order
                </h1>
                <p className="text-gray-600">
                  Enter the share code you received from your host to join their group order.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="shareCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Share Code or Order Name
                  </label>
                  <input
                    type="text"
                    id="shareCode"
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value)}
                    placeholder="e.g., BACH-SARAH-2026"
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ask your host for the order name or share code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 tracking-[0.15em] transition-colors font-medium ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-gold-600 hover:bg-gold-700 text-gray-900'
                  }`}
                >
                  {isLoading ? 'FINDING ORDER...' : 'JOIN ORDER'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Create Order Link */}
              <div className="text-center">
                <p className="text-gray-600 mb-3">
                  Want to host your own group order?
                </p>
                <Link
                  href="/group/create"
                  className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create a Group Order
                </Link>
              </div>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How it works
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Enter the share code from your host</li>
                  <li>2. View the group order details</li>
                  <li>3. Add your items to the cart</li>
                  <li>4. Check out individually with FREE delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
