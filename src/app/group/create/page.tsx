'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { GroupOrderAPI } from '@/lib/group-orders/api'

export default function CreateGroupOrderPage() {
  const router = useRouter()
  const { setGroupOrderCode } = useGroupOrderContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    deliveryDate: '',
    deliveryTime: '12:00 PM - 2:00 PM',
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
      setError(err instanceof Error ? err.message : 'Failed to create group order')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate minimum date (72 hours from now)
  const getMinDate = () => {
    const date = new Date()
    date.setHours(date.getHours() + 72)
    return date.toISOString().split('T')[0]
  }

  const timeSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-cormorant text-gray-900 mb-2 text-center">
              Create Group Order
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Start a group order and invite friends to add their items. You&apos;ll pay for everyone at checkout.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
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
                  placeholder="e.g., Sarah's Birthday Party"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
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
                  Delivery Date * <span className="text-gray-500 font-normal">(72+ hours advance)</span>
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
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

              {/* Minimum Order Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Group orders require a minimum of $150 total before checkout.
                  All participants can add items, but only you (the host) will pay at checkout.
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
  )
}
