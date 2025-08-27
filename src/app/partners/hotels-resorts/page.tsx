'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import { motion } from 'framer-motion'
import { useProducts } from '@/lib/shopify/hooks/useProducts'
import { useCart } from '@/lib/shopify/hooks/useCart'
import { formatPrice } from '@/lib/shopify/utils'
import CompactProductCard from '@/components/shopify/CompactProductCard'

export default function HotelsResortsPartnerPage() {
  const [selectedCategory, setSelectedCategory] = useState('welcome')
  const [roomNumber, setRoomNumber] = useState('')
  const [guestName, setGuestName] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('asap')
  const [showOrderForm, setShowOrderForm] = useState(false)
  
  const { products, loading } = useProducts()
  const { cart, addToCart, isAddingToCart } = useCart()

  // Auto-verify age for B2B partner ordering
  useEffect(() => {
    localStorage.setItem('age_verified', 'true')
  }, [])

  // Filter products by category for hotel context
  const getCategoryProducts = () => {
    if (!products) return []
    
    switch(selectedCategory) {
      case 'welcome':
        // Champagne and premium wines for welcome packages
        return products.filter(p => 
          p.productType?.toLowerCase().includes('champagne') ||
          p.productType?.toLowerCase().includes('wine') ||
          p.title.toLowerCase().includes('champagne') ||
          p.title.toLowerCase().includes('prosecco')
        ).slice(0, 6)
      
      case 'minibar':
        // Variety of spirits and mixers
        return products.filter(p => 
          p.productType?.toLowerCase().includes('vodka') ||
          p.productType?.toLowerCase().includes('whiskey') ||
          p.productType?.toLowerCase().includes('gin') ||
          p.productType?.toLowerCase().includes('rum') ||
          p.title.toLowerCase().includes('mixer')
        ).slice(0, 8)
      
      case 'events':
        // Premium spirits and champagnes for events
        return products.filter(p => 
          p.priceRange.minVariantPrice.amount > 50 ||
          p.productType?.toLowerCase().includes('champagne') ||
          p.productType?.toLowerCase().includes('cognac')
        ).slice(0, 6)
      
      case 'poolside':
        // Seltzers, beers, and refreshing cocktails
        return products.filter(p => 
          p.productType?.toLowerCase().includes('seltzer') ||
          p.productType?.toLowerCase().includes('beer') ||
          p.productType?.toLowerCase().includes('tequila') ||
          p.title.toLowerCase().includes('margarita')
        ).slice(0, 8)
      
      default:
        return products.slice(0, 8)
    }
  }

  const categoryProducts = getCategoryProducts()

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hotel Partner Header */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/backgrounds/rooftop-terrace-elegant-1.webp"
          alt="The Grand Austin Hotel"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-px bg-gold-500" />
              <span className="mx-3 text-gold-500 text-xs tracking-[0.2em]">WELCOME TO</span>
              <div className="w-20 h-px bg-gold-500" />
            </div>
            
            <h1 className="font-cormorant text-5xl md:text-6xl text-white mb-3 tracking-[0.1em]">
              THE GRAND AUSTIN
            </h1>
            <p className="text-lg text-gray-200 mb-6">
              Luxury Spirits & Wine Delivered to Your Suite
            </p>
            
            <div className="flex justify-center gap-4 text-sm text-gray-300">
              <span>Room Service Available 24/7</span>
              <span className="text-gold-500">•</span>
              <span>Express 30-Minute Delivery</span>
              <span className="text-gold-500">•</span>
              <span>Curated Selection</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Order Bar */}
      <section className="bg-gray-900 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Delivery Hours: 10am - 2am</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Charge to Room Available</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowOrderForm(!showOrderForm)}
              className="px-6 py-2 bg-gold-600 text-white text-sm hover:bg-gold-700 transition-colors tracking-[0.1em]"
            >
              {showOrderForm ? 'BROWSE MENU' : 'QUICK ORDER'}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Order Form */}
      {showOrderForm && (
        <motion.section 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gray-50 border-b border-gray-200"
        >
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1 tracking-[0.1em]">ROOM NUMBER</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 412"
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 tracking-[0.1em]">GUEST NAME</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 tracking-[0.1em]">DELIVERY TIME</label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none"
                >
                  <option value="asap">ASAP (30 min)</option>
                  <option value="1hour">Within 1 Hour</option>
                  <option value="2hours">Within 2 Hours</option>
                  <option value="scheduled">Schedule for Later</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 tracking-[0.1em]">BILLING</label>
                <select className="w-full px-3 py-2 border border-gray-300 focus:border-gold-600 focus:outline-none">
                  <option>Charge to Room</option>
                  <option>Pay on Delivery</option>
                </select>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Category Navigation */}
      <section className="py-6 border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-center gap-8">
            {[
              { id: 'welcome', label: 'WELCOME PACKAGES', icon: '🥂' },
              { id: 'minibar', label: 'SUITE MINIBAR', icon: '🥃' },
              { id: 'events', label: 'PRIVATE EVENTS', icon: '🍾' },
              { id: 'poolside', label: 'POOL & TERRACE', icon: '🍹' }
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`pb-2 border-b-2 transition-all tracking-[0.1em] ${
                  selectedCategory === category.id
                    ? 'border-gold-600 text-gold-600'
                    : 'border-transparent text-gray-600 hover:text-gold-600'
                }`}
              >
                <span className="text-xs font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Header */}
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-8">
            {selectedCategory === 'welcome' && (
              <>
                <h2 className="font-cormorant text-3xl mb-3 tracking-[0.1em]">VIP WELCOME PACKAGES</h2>
                <p className="text-gray-600">Impress your guests with premium champagnes and curated gift sets</p>
              </>
            )}
            {selectedCategory === 'minibar' && (
              <>
                <h2 className="font-cormorant text-3xl mb-3 tracking-[0.1em]">PREMIUM SUITE MINIBAR</h2>
                <p className="text-gray-600">Stock your suite with top-shelf spirits and mixers</p>
              </>
            )}
            {selectedCategory === 'events' && (
              <>
                <h2 className="font-cormorant text-3xl mb-3 tracking-[0.1em]">PRIVATE EVENT COLLECTION</h2>
                <p className="text-gray-600">Exclusive selections for corporate gatherings and celebrations</p>
              </>
            )}
            {selectedCategory === 'poolside' && (
              <>
                <h2 className="font-cormorant text-3xl mb-3 tracking-[0.1em]">POOL & TERRACE SERVICE</h2>
                <p className="text-gray-600">Refreshing cocktails and seltzers for outdoor relaxation</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
              <p className="mt-4 text-gray-600">Loading premium selection...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <div key={product.id} className="relative">
                  <CompactProductCard product={product} />
                  
                  {/* Hotel-specific badges */}
                  {selectedCategory === 'welcome' && product.priceRange.minVariantPrice.amount > 100 && (
                    <div className="absolute top-2 right-2 bg-gold-600 text-white text-xs px-2 py-1 tracking-[0.1em]">
                      VIP CHOICE
                    </div>
                  )}
                  {selectedCategory === 'minibar' && (
                    <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 tracking-[0.1em]">
                      SUITE STOCK
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No products fallback */}
          {!loading && categoryProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Hotel Services */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-3">
                <svg className="w-full h-full text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">30-MINUTE DELIVERY</h3>
              <p className="text-sm text-gray-600">Express service to your suite</p>
            </div>
            
            <div>
              <div className="w-12 h-12 mx-auto mb-3">
                <svg className="w-full h-full text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">CHARGE TO ROOM</h3>
              <p className="text-sm text-gray-600">Convenient billing options</p>
            </div>
            
            <div>
              <div className="w-12 h-12 mx-auto mb-3">
                <svg className="w-full h-full text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">CUSTOM PACKAGES</h3>
              <p className="text-sm text-gray-600">Personalized for VIP guests</p>
            </div>
            
            <div>
              <div className="w-12 h-12 mx-auto mb-3">
                <svg className="w-full h-full text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">CONCIERGE SERVICE</h3>
              <p className="text-sm text-gray-600">24/7 support available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Packages */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-8">
            <h2 className="font-cormorant text-3xl mb-3 tracking-[0.1em]">SIGNATURE EXPERIENCES</h2>
            <p className="text-gray-600">Curated packages for special occasions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/images/gallery/sunset-champagne-pontoon.webp"
                  alt="Romance Package"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-cormorant text-xl mb-2 tracking-[0.1em]">ROMANCE PACKAGE</h3>
                <p className="text-gray-600 text-sm mb-4">Champagne, chocolates, and rose petals</p>
                <p className="text-2xl font-cormorant text-gold-600 mb-4">$299</p>
                <button className="w-full py-2 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all text-sm tracking-[0.1em]">
                  ORDER NOW
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/images/services/corporate/executive-cocktail-hour.webp"
                  alt="Executive Package"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-cormorant text-xl mb-2 tracking-[0.1em]">EXECUTIVE PACKAGE</h3>
                <p className="text-gray-600 text-sm mb-4">Premium whiskey selection with cigars</p>
                <p className="text-2xl font-cormorant text-gold-600 mb-4">$499</p>
                <button className="w-full py-2 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all text-sm tracking-[0.1em]">
                  ORDER NOW
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/images/gallery/elegant-waterfront-dinner.webp"
                  alt="Celebration Package"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-cormorant text-xl mb-2 tracking-[0.1em]">CELEBRATION PACKAGE</h3>
                <p className="text-gray-600 text-sm mb-4">Champagne tower service for groups</p>
                <p className="text-2xl font-cormorant text-gold-600 mb-4">$699</p>
                <button className="w-full py-2 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all text-sm tracking-[0.1em]">
                  ORDER NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section className="py-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-sm text-gray-400 mb-2">NEED ASSISTANCE WITH YOUR ORDER?</p>
          <div className="flex items-center justify-center gap-8">
            <a href="tel:512-555-0100" className="flex items-center gap-2 text-gold-500 hover:text-gold-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Call Concierge</span>
            </a>
            <span className="text-gray-600">|</span>
            <button className="flex items-center gap-2 text-gold-500 hover:text-gold-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Live Chat</span>
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Room Service Ext. 7100</span>
          </div>
        </div>
      </section>
    </div>
  )
}