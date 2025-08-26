'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerContext } from '@/contexts/CustomerContext'
import { motion } from 'framer-motion'

interface Address {
  id: string
  address1: string
  address2?: string
  city: string
  province: string
  zip: string
  country: string
  isDefault?: boolean
}

export default function AddressesPage() {
  const router = useRouter()
  const { customer, isAuthenticated } = useCustomerContext()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/account')
    }
  }, [isAuthenticated, router])

  // Mock addresses for now - will connect to Shopify later
  useEffect(() => {
    if (customer) {
      setAddresses([
        {
          id: '1',
          address1: '123 Main St',
          city: 'Austin',
          province: 'TX',
          zip: '78701',
          country: 'United States',
          isDefault: true
        }
      ])
    }
  }, [customer])

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault()
    // Will implement save logic with Shopify API
    setIsAddingNew(false)
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-cormorant mb-2">My Addresses</h1>
            <p className="text-gray-600">Manage your shipping and billing addresses</p>
          </div>

          {/* Navigation */}
          <div className="flex space-x-6 mb-8 border-b">
            <button
              onClick={() => router.push('/account')}
              className="pb-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Account Details
            </button>
            <button
              onClick={() => router.push('/account/orders')}
              className="pb-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Order History
            </button>
            <button
              className="pb-3 text-gold-600 border-b-2 border-gold-600"
            >
              Addresses
            </button>
          </div>

          {/* Address Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Addresses */}
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                {address.isDefault && (
                  <span className="inline-block px-2 py-1 bg-gold-100 text-gold-700 text-xs rounded mb-3">
                    DEFAULT
                  </span>
                )}
                
                {editingId === address.id ? (
                  <form onSubmit={handleSaveAddress} className="space-y-3">
                    <input
                      type="text"
                      defaultValue={address.address1}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Address Line 1"
                      required
                    />
                    <input
                      type="text"
                      defaultValue={address.address2}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Address Line 2 (optional)"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        defaultValue={address.city}
                        className="px-3 py-2 border rounded"
                        placeholder="City"
                        required
                      />
                      <input
                        type="text"
                        defaultValue={address.province}
                        className="px-3 py-2 border rounded"
                        placeholder="State"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      defaultValue={address.zip}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="ZIP Code"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gold-600 text-white text-sm hover:bg-gold-700"
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-gray-900 mb-1">{address.address1}</p>
                    {address.address2 && (
                      <p className="text-gray-900 mb-1">{address.address2}</p>
                    )}
                    <p className="text-gray-600">
                      {address.city}, {address.province} {address.zip}
                    </p>
                    <p className="text-gray-600 mb-4">{address.country}</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(address.id)}
                        className="text-sm text-gold-600 hover:text-gold-700"
                      >
                        Edit
                      </button>
                      {!address.isDefault && (
                        <>
                          <span className="text-gray-400">•</span>
                          <button className="text-sm text-gray-600 hover:text-gray-700">
                            Set as Default
                          </button>
                          <span className="text-gray-400">•</span>
                          <button className="text-sm text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}

            {/* Add New Address Card */}
            {isAddingNew ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-medium mb-4">New Address</h3>
                <form onSubmit={handleSaveAddress} className="space-y-3">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Address Line 1"
                    required
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Address Line 2 (optional)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="px-3 py-2 border rounded"
                      placeholder="City"
                      required
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border rounded"
                      placeholder="State"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="ZIP Code"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold-600 text-white text-sm hover:bg-gold-700"
                    >
                      SAVE ADDRESS
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsAddingNew(true)}
                className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-gold-600 transition-colors flex flex-col items-center justify-center min-h-[200px]"
              >
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-gray-600">Add New Address</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}