'use client'

import React from 'react'
import Image from 'next/image'
import OldFashionedNavigation from '@/components/OldFashionedNavigation'
import { motion } from 'framer-motion'

export default function RestaurantsBarsPartnerPage() {
  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/backgrounds/elegant-bar-gold-accent.webp"
          alt="Premium Bar Service"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-px bg-gold-500" />
              <span className="mx-4 text-gold-500 text-sm tracking-[0.2em]">PARTNER SPOTLIGHT</span>
              <div className="w-24 h-px bg-gold-500" />
            </div>
            
            <h1 className="font-cormorant text-6xl md:text-7xl text-white mb-6 tracking-[0.1em]">
              MIDNIGHT COWBOY
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Austin&apos;s Most Exclusive Speakeasy Partners with PartyOn Delivery
              <br />for Premium Spirit Procurement and Private Event Services
            </p>
            
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">8</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">YEARS PARTNERSHIP</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">300+</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">RARE SPIRITS</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">#1</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">AUSTIN COCKTAIL BAR</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              ELEVATE YOUR BEVERAGE PROGRAM
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reliable supply chain, exclusive selections, and expert consultation 
              to enhance your establishment&apos;s offerings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">SUPPLY CHAIN</h3>
              <p className="text-gray-600 mb-4">
                Consistent inventory with guaranteed availability and competitive pricing
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Next-day delivery
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Emergency restocking
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Bulk order discounts
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">EXCLUSIVE ACCESS</h3>
              <p className="text-gray-600 mb-4">
                Rare and allocated spirits, limited releases, and custom labels
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Allocated bourbon list
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Private barrel programs
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Custom house spirits
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">CONSULTATION</h3>
              <p className="text-gray-600 mb-4">
                Menu development, staff training, and seasonal program creation
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Cocktail menu design
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Mixology workshops
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Trend forecasting
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold-500 text-sm tracking-[0.2em]">SUCCESS STORY</span>
              <h2 className="font-cormorant text-4xl mt-2 mb-6 tracking-[0.1em]">
                PRIVATE BARREL SELECTION
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Midnight Cowboy partnered with PartyOn Delivery to select and bottle their 
                own private barrel of bourbon, creating an exclusive offering that became 
                their best-selling premium pour.
              </p>
              
              <div className="border-l-4 border-gold-500 pl-6 mb-8">
                <p className="text-gray-700 italic mb-2">
                  &ldquo;PartyOn Delivery&apos;s expertise and industry connections made it possible for us 
                  to offer something truly unique. Our private barrel program has not only increased 
                  revenue but elevated our entire brand perception.&rdquo;
                </p>
                <p className="text-sm text-gray-500">
                  — James Russell, Head Bartender, Midnight Cowboy
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">240</p>
                  <p className="text-sm text-gray-600">Bottles Sold</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">300%</p>
                  <p className="text-sm text-gray-600">ROI</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">$85</p>
                  <p className="text-sm text-gray-600">Per Pour</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px]">
              <Image
                src="/images/hero/cocktails-golden-hour.webp"
                alt="Premium Cocktail Service"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              COMPREHENSIVE RESTAURANT & BAR SOLUTIONS
            </h2>
            <p className="text-gray-600">
              Tailored programs for every type of establishment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">FINE DINING</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Wine pairing consultations
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Rare vintage sourcing
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Sommelier support
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Private dining packages
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">COCKTAIL BARS</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Craft spirit selection
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Seasonal menu development
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Competition supplies
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Guest bartender events
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">BREWERIES</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Guest tap programs
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Spirit additions
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Event bar services
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Collaboration projects
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">HOTELS</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Lobby bar programs
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Poolside service
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Room service menus
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Banquet supplies
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">MUSIC VENUES</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  High-volume service
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  VIP packages
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Artist riders
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Festival support
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">RESTAURANTS</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Wine list curation
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Happy hour programs
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Catering add-ons
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Staff education
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Programs */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              PARTNERSHIP TIERS
            </h2>
            <p className="text-gray-600">
              Flexible programs designed to grow with your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">ESSENTIAL</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$5K<span className="text-base">/month minimum</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>Wholesale pricing</li>
                <li>Weekly delivery</li>
                <li>Online ordering portal</li>
                <li>Basic menu consultation</li>
                <li>30-day payment terms</li>
              </ul>
              <button className="w-full py-3 border border-gold-500 text-gold-600 hover:bg-gold-600 hover:text-white transition-all tracking-[0.1em]">
                GET STARTED
              </button>
            </div>

            <div className="bg-white border-2 border-gold-500 p-8 text-center relative transform scale-105 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-1 text-xs tracking-[0.1em]">
                MOST POPULAR
              </div>
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">PREMIUM</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$15K<span className="text-base">/month minimum</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>Best pricing tier</li>
                <li>Daily delivery available</li>
                <li>Priority allocations</li>
                <li>Quarterly menu reviews</li>
                <li>Staff training included</li>
                <li>45-day payment terms</li>
                <li>Marketing support</li>
              </ul>
              <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em]">
                APPLY NOW
              </button>
            </div>

            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">ELITE</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$30K+<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>Exclusive pricing</li>
                <li>On-demand delivery</li>
                <li>First access to rarities</li>
                <li>Monthly consultations</li>
                <li>Custom programs</li>
                <li>60-day payment terms</li>
                <li>Co-branded events</li>
                <li>Revenue sharing options</li>
              </ul>
              <button className="w-full py-3 border border-gold-500 text-gold-600 hover:bg-gold-600 hover:text-white transition-all tracking-[0.1em]">
                CONTACT SALES
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-cormorant text-4xl mb-6 tracking-[0.1em]">
            PARTNER WITH AUSTIN&apos;S BEVERAGE EXPERTS
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Join over 200 restaurants and bars that trust PartyOn Delivery for 
            reliable supply, competitive pricing, and exceptional service. 
            Let us help you elevate your beverage program.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
              REQUEST PRICING
            </button>
            <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
              SCHEDULE TASTING
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Call our trade team at{' '}
            <a href="tel:512-555-0200" className="text-gold-500 hover:text-gold-400">
              (512) 555-0200
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}