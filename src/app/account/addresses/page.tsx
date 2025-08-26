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

  // Load addresses from localStorage (Shopify Customer API doesn't support address management yet)
  useEffect(() => {
    if (customer) {
      const savedAddresses = localStorage.getItem(`addresses_${customer.id}`)
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses))
      } else {
        // Default address if none saved
        setAddresses([])
      }
    }
  }, [customer])

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (customer && addresses.length > 0) {
      localStorage.setItem(`addresses_${customer.id}`, JSON.stringify(addresses))
    }
  }, [addresses, customer])

  const handleSaveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newAddress: Address = {
      id: editingId || `addr_${Date.now()}`,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string || undefined,
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      zip: formData.get('zip') as string,
      country: 'United States',
      isDefault: editingId ? addresses.find(a => a.id === editingId)?.isDefault : addresses.length === 0
    }

    if (editingId) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId ? newAddress : addr
      ))
    } else {
      setAddresses(prev => [...prev, newAddress])
    }
    
    setIsAddingNew(false)
    setEditingId(null)
  }

  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id))
    }
  }

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-cormorant mb-3 text-gray-900 tracking-[0.15em]">MY ADDRESSES</h1>
            <p className="text-gray-600 tracking-[0.1em]">Manage your shipping and billing addresses</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg shadow-sm p-2 flex space-x-2">
              <button
                onClick={() => router.push('/account')}
                className="px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gold-50 hover:text-gold-700 transition-all rounded-md"
              >
                ACCOUNT DETAILS
              </button>
              <button
                onClick={() => router.push('/account/orders')}
                className="px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gold-50 hover:text-gold-700 transition-all rounded-md"
              >
                ORDER HISTORY
              </button>
              <button
                className="px-6 py-3 text-sm tracking-[0.1em] bg-gold-600 text-white rounded-md font-medium"
              >
                ADDRESSES
              </button>
            </div>
          </div>

          {/* Address Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Addresses */}
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                {address.isDefault && (
                  <span className="inline-block px-2 py-1 bg-gold-100 text-gold-700 text-xs rounded mb-3">
                    DEFAULT
                  </span>
                )}
                
                {editingId === address.id ? (
                  <form onSubmit={handleSaveAddress} className="space-y-3">
                    <input
                      name="address1"
                      type="text"
                      defaultValue={address.address1}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                      placeholder="Address Line 1"
                      required
                    />
                    <input
                      name="address2"
                      type="text"
                      defaultValue={address.address2}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                      placeholder="Address Line 2 (optional)"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="city"
                        type="text"
                        defaultValue={address.city}
                        className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="City"
                        required
                      />
                      <input
                        name="province"
                        type="text"
                        defaultValue={address.province}
                        className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                        placeholder="State"
                        required
                      />
                    </div>
                    <input
                      name="zip"
                      type="text"
                      defaultValue={address.zip}
                      className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                      placeholder="ZIP Code"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gold-600 text-white text-sm hover:bg-gold-700 transition-colors tracking-[0.1em]"
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors tracking-[0.1em]"
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
                          <button 
                            onClick={() => handleSetDefault(address.id)}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Set as Default
                          </button>
                          <span className="text-gray-400">•</span>
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
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
                    name="address1"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    placeholder="Address Line 1"
                    required
                  />
                  <input
                    name="address2"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    placeholder="Address Line 2 (optional)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="city"
                      type="text"
                      className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                      placeholder="City"
                      required
                    />
                    <input
                      name="province"
                      type="text"
                      className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                      placeholder="State"
                      required
                    />
                  </div>
                  <input
                    name="zip"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    placeholder="ZIP Code"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold-600 text-white text-sm hover:bg-gold-700 transition-colors tracking-[0.1em]"
                    >
                      SAVE ADDRESS
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors tracking-[0.1em]"
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