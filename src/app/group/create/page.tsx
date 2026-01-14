'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import Footer from '@/components/Footer'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { GroupOrderAPI } from '@/lib/group-orders/api'

// Partner addresses for quick selection
const PARTNER_ADDRESSES = [
  {
    label: 'Premier Party Cruises [Anderson Mill Marina]',
    address1: '13993 FM 2769',
    address2: '',
    city: 'Leander',
    province: 'TX',
    zip: '78641',
  },
]

export default function CreateGroupOrderPage() {
  const router = useRouter()
  const { setGroupOrderCode } = useGroupOrderContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    deliveryDate: '',
    deliveryTime: '12:00 PM - 1:00 PM',
    address1: '',
    address2: '',
    city: 'Austin',
    province: 'TX',
    zip: '',
    customerName: '',
    customerId: '',
  })

  // Generate a simple customer ID if not logged in
  const getOrCreateCustomerId = () => {
    let customerId = localStorage.getItem('customerId')
    if (!customerId) {
      customerId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('customerId', customerId)
    }
    return customerId
  }

  // Check if a date is Sunday
  const isSunday = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00')
    return date.getDay() === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const customerId = getOrCreateCustomerId()

      // Get minimum date (72 hours from now)
      const minDate = new Date()
      minDate.setHours(minDate.getHours() + 72)

      const selectedDate = new Date(formData.deliveryDate)
      if (selectedDate < minDate) {
        throw new Error('Delivery date must be at least 72 hours from now')
      }

      // No Sunday deliveries
      if (isSunday(formData.deliveryDate)) {
        throw new Error('Sorry, we do not deliver on Sundays. Please select another day.')
      }

      const result = await GroupOrderAPI.create({
        name: formData.name,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        deliveryAddress: {
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          province: formData.province,
          zip: formData.zip,
          country: 'US',
        },
        customerId,
        customerName: formData.customerName || 'Host',
      })

      if (result && result.shareCode) {
        // Save the share code to context (and localStorage)
        setGroupOrderCode(result.shareCode)

        // Short delay to let context update
        setTimeout(() => {
          router.push('/group/dashboard')
        }, 100)
      }
    } catch (err) {
      // Extract detailed error message
      let errorMessage = 'Failed to create group order'
      if (err instanceof Error) {
        errorMessage = err.message
        // Check for common issues
        if (err.message.includes('fetch') || err.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else if (err.message.includes('500') || err.message.includes('server')) {
          errorMessage = 'Server error. Our team has been notified. Please try again in a few minutes.'
        }
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate minimum date (72 hours from now), skip Sundays
  const getMinDate = () => {
    const date = new Date()
    date.setHours(date.getHours() + 72)
    // If minimum date lands on Sunday, push to Monday
    if (date.getDay() === 0) {
      date.setDate(date.getDate() + 1)
    }
    return date.toISOString().split('T')[0]
  }

  // 1-hour time slots
  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
  ]

  // Handle partner address selection
  const handlePartnerAddressSelect = (index: number) => {
    if (index === -1) return // "Select..." option
    const addr = PARTNER_ADDRESSES[index]
    setFormData({
      ...formData,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      province: addr.province,
      zip: addr.zip,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OldFashionedNavigation />

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Back link */}
            <Link
              href="/products"
              className="inline-flex items-center text-gray-600 hover:text-gold-600 mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-cormorant text-gray-900 mb-2 text-center">
                Create Group Order
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Start a group order and invite friends to add their items. Everyone checks out individually and gets FREE DELIVERY!
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">Unable to create group order</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                      <p className="text-red-600 text-xs mt-2">
                        Please check your information and try again. If the problem persists,
                        <Link href="/contact" className="underline ml-1">contact us</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., BACH-SARAH-2026"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  (This will be the name you share with your group - make it good!)
                </p>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date * <span className="text-gray-500 font-normal">(72+ hours advance, no Sundays)</span>
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.deliveryDate}
                  onChange={(e) => {
                    const val = e.target.value
                    if (isSunday(val)) {
                      setError('Sorry, we do not deliver on Sundays. Please select another day.')
                    } else {
                      setError(null)
                    }
                    setFormData({ ...formData, deliveryDate: val })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time Window *
                </label>
                <select
                  required
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Address *
                </label>

                {/* Partner Addresses Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gold-700 mb-1 tracking-wide">
                    PARTNER ADDRESSES
                  </label>
                  <select
                    onChange={(e) => handlePartnerAddressSelect(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gold-300 rounded bg-gold-50 focus:ring-2 focus:ring-gold-500 focus:border-transparent text-gray-700"
                    defaultValue="-1"
                  >
                    <option value="-1">Select a partner location...</option>
                    {PARTNER_ADDRESSES.map((addr, i) => (
                      <option key={i} value={i}>{addr.label}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">or enter address manually</span>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  placeholder="Apt, suite, unit (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="State"
                    className="px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="ZIP"
                    className="px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* FREE DELIVERY Notice */}
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-green-800">FREE DELIVERY for all participants!</span>
                </div>
                <p className="text-sm text-green-700">
                  Share the link with your group. Everyone shops and checks out individually - no minimums, no waiting.
                  All orders deliver together at your scheduled time.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 tracking-[0.15em] transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gold-600 hover:bg-gold-700'
                } text-gray-900 font-medium`}
              >
                {isLoading ? 'CREATING...' : 'CREATE GROUP ORDER'}
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
