'use client'

import { useState, useEffect } from 'react'
import { useCustomerContext } from '@/contexts/CustomerContext'
import AccountLayout from '@/components/account/AccountLayout'
import CustomerAuth from '@/components/CustomerAuth'


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
  const { customer, isAuthenticated, loading } = useCustomerContext()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setIsAuthOpen(true)
    }
  }, [loading, isAuthenticated])

  // Load addresses from localStorage
  useEffect(() => {
    if (customer) {
      const savedAddresses = localStorage.getItem(`addresses_${customer.id}`)
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses))
      } else {
        // Initialize with default addresses
        const defaultAddresses = [
          {
            id: 'default_1',
            address1: '123 Main Street',
            address2: 'Apt 4B',
            city: 'Austin',
            province: 'TX',
            zip: '78701',
            country: 'United States',
            isDefault: true
          }
        ]
        setAddresses(defaultAddresses)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
          <p className="mt-4 text-gray-600">Loading your addresses...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <CustomerAuth 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          redirectTo="/account/addresses"
        />
        <div className="text-center px-4">
          <h2 className="text-3xl font-cormorant mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to manage your addresses</p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em]"
          >
            SIGN IN TO CONTINUE
          </button>
        </div>
      </div>
    )
  }

  return (
    <AccountLayout title="Delivery Addresses">
      {/* Address Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
          <p className="text-xs text-gray-500 tracking-[0.1em]">SAVED ADDRESSES</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-2xl font-bold text-green-600">
            {addresses.filter(a => a.isDefault).length}
          </p>
          <p className="text-xs text-gray-500 tracking-[0.1em]">DEFAULT ADDRESS</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">Austin</p>
          <p className="text-xs text-gray-500 tracking-[0.1em]">DELIVERY AREA</p>
        </div>
      </div>

      {/* Address Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing Addresses */}
        {addresses.map((address) => (
          <div
            key={address.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 hero-fade-in"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                {address.isDefault && (
                  <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 text-xs rounded-full mb-3 tracking-[0.1em]">
                    DEFAULT
                  </span>
                )}
                <div className="flex items-center space-x-2 text-gray-900">
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="font-medium">Delivery Address</p>
                </div>
              </div>
            </div>
            
            {editingId === address.id ? (
              <form onSubmit={handleSaveAddress} className="space-y-3">
                <input
                  name="address1"
                  type="text"
                  defaultValue={address.address1}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                  placeholder="Address Line 1"
                  required
                />
                <input
                  name="address2"
                  type="text"
                  defaultValue={address.address2}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                  placeholder="Address Line 2 (optional)"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="city"
                    type="text"
                    defaultValue={address.city}
                    className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                    placeholder="City"
                    required
                  />
                  <input
                    name="province"
                    type="text"
                    defaultValue={address.province}
                    className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                    placeholder="State"
                    required
                  />
                </div>
                <input
                  name="zip"
                  type="text"
                  defaultValue={address.zip}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                  placeholder="ZIP Code"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gold-600 text-gray-900 text-sm hover:bg-gold-700 transition-colors tracking-[0.1em] rounded"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors tracking-[0.1em] rounded"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-4 space-y-1">
                  <p className="text-gray-900">{address.address1}</p>
                  {address.address2 && (
                    <p className="text-gray-900">{address.address2}</p>
                  )}
                  <p className="text-gray-600">
                    {address.city}, {address.province} {address.zip}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setEditingId(address.id)}
                    className="text-sm text-gold-600 hover:text-gold-700 tracking-[0.1em]"
                  >
                    EDIT
                  </button>
                  {!address.isDefault && (
                    <>
                      <span className="text-gray-400">•</span>
                      <button 
                        onClick={() => handleSetDefault(address.id)}
                        className="text-sm text-gray-600 hover:text-gray-700 tracking-[0.1em]"
                      >
                        SET DEFAULT
                      </button>
                      <span className="text-gray-400">•</span>
                      <button 
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-sm text-red-600 hover:text-red-700 tracking-[0.1em]"
                      >
                        DELETE
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add New Address Card */}
        {isAddingNew ? (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hero-fade-in">
            <h3 className="text-lg font-medium mb-4">New Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <input
                name="address1"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                placeholder="Address Line 1"
                required
              />
              <input
                name="address2"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                placeholder="Address Line 2 (optional)"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  type="text"
                  className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                  placeholder="City"
                  required
                />
                <input
                  name="province"
                  type="text"
                  className="px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                  placeholder="State"
                  required
                />
              </div>
              <input
                name="zip"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors rounded"
                placeholder="ZIP Code"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold-600 text-gray-900 text-sm hover:bg-gold-700 transition-colors tracking-[0.1em] rounded"
                >
                  SAVE ADDRESS
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50 transition-colors tracking-[0.1em] rounded"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-gold-600 transition-colors flex flex-col items-center justify-center min-h-[280px] group hero-fade-in"
          >
            <svg className="w-12 h-12 text-gray-400 mb-4 group-hover:text-gold-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-gray-600 group-hover:text-gold-600 tracking-[0.1em]">ADD NEW ADDRESS</span>
          </button>
        )}
      </div>

      {/* Delivery Information */}
      <div className="mt-12 bg-gradient-to-r from-gold-50 to-gold-100 rounded-lg p-8">
        <h3 className="text-xl font-cormorant text-gray-900 mb-4">Delivery Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Delivery Areas</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>All Austin ZIP codes</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Select areas in surrounding cities</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Delivery Options</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Standard delivery (72-hour notice)</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Express delivery (3-hour on orders $50+)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AccountLayout>
  )
}