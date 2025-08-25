'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateGroupOrder } from '@/lib/group-orders/hooks'
import { useCustomerContext } from '@/contexts/CustomerContext'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'
import { add, format } from 'date-fns'

interface CreateGroupOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (shareCode: string) => void
}

export default function CreateGroupOrderModal({ isOpen, onClose, onSuccess }: CreateGroupOrderModalProps) {
  const { customer } = useCustomerContext()
  const { setGroupOrderCode } = useGroupOrderContext()
  const { createGroupOrder } = useCreateGroupOrder()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [eventName, setEventName] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [address, setAddress] = useState({
    address1: '',
    address2: '',
    city: 'Austin',
    province: 'TX',
    zip: '',
    country: 'US'
  })

  // Generate min date (72 hours from now)
  const minDate = format(add(new Date(), { days: 3 }), 'yyyy-MM-dd')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!customer) {
      setError('Please log in to create a group order')
      return
    }

    setIsLoading(true)

    try {
      const result = await createGroupOrder({
        name: eventName,
        deliveryDate,
        deliveryTime,
        deliveryAddress: address,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`
      })
      
      setGroupOrderCode(result.shareCode)
      onSuccess(result.shareCode)
    } catch (err) {
      setError('Failed to create group order. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-cormorant mb-6 tracking-[0.1em]">
              CREATE GROUP ORDER
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm tracking-[0.1em] mb-2">
                  EVENT NAME
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Office Happy Hour"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm tracking-[0.1em] mb-2">
                    DELIVERY DATE
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={minDate}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm tracking-[0.1em] mb-2">
                    TIME
                  </label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="7:00 PM">7:00 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm tracking-[0.1em] mb-2">
                  DELIVERY ADDRESS
                </label>
                <input
                  type="text"
                  value={address.address1}
                  onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  placeholder="Street address"
                  required
                />
                <input
                  type="text"
                  value={address.address2}
                  onChange={(e) => setAddress({ ...address, address2: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  placeholder="Apt, suite, etc. (optional)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                    placeholder="City"
                    required
                  />
                  <input
                    type="text"
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                    placeholder="ZIP code"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 py-3 tracking-[0.1em] 
                    hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-3 tracking-[0.1em] 
                    hover:bg-gold-500 transition-colors disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'CREATING...' : 'CREATE ORDER'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}