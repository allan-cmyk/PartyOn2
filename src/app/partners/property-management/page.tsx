'use client'

import React from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'

export default function PropertyManagementPartnerPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/austin-skyline-golden-hour.webp"
          alt="Luxury Austin Properties"
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
              THE INDEPENDENT
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Austin&apos;s Premier Residential Tower Partners with PartyOn Delivery
              <br />for Exclusive Resident Amenities and Concierge Services
            </p>
            
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">370</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">LUXURY RESIDENCES</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">58</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">FLOORS</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">24/7</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">CONCIERGE SERVICE</p>
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
              ELEVATE YOUR RESIDENT EXPERIENCE
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Differentiate your property with exclusive access to curated spirits, 
              VIP delivery services, and premium resident events
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">RESIDENT PERKS</h3>
              <p className="text-gray-600 mb-4">
                Exclusive discounts, priority delivery, and VIP access to limited releases
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  15% resident discount
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Same-day delivery guarantee
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Move-in welcome packages
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">AMENITY EVENTS</h3>
              <p className="text-gray-600 mb-4">
                Rooftop tastings, pool deck happy hours, and seasonal celebrations
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Monthly wine tastings
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Cocktail masterclasses
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Holiday celebrations
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">CONCIERGE INTEGRATION</h3>
              <p className="text-gray-600 mb-4">
                Seamless ordering through your concierge app with white-glove service
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  API integration available
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Dedicated support line
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Secure lobby delivery
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
            <div className="relative h-[500px]">
              <Image
                src="/images/backgrounds/lake-travis-wedding-venue.webp"
                alt="Rooftop Event at The Independent"
                fill
                className="object-cover"
              />
            </div>
            
            <div>
              <span className="text-gold-500 text-sm tracking-[0.2em]">SUCCESS STORY</span>
              <h2 className="font-cormorant text-4xl mt-2 mb-6 tracking-[0.1em]">
                TRANSFORMING RESIDENT SATISFACTION
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Since partnering with PartyOn Delivery, The Independent has seen a 40% increase 
                in resident satisfaction scores and a 25% reduction in turnover among premium units.
              </p>
              
              <div className="border-l-4 border-gold-500 pl-6 mb-8">
                <p className="text-gray-700 italic mb-2">
                  &ldquo;The PartyOn partnership has become one of our most valued amenities. 
                  Residents love the exclusive access and the quality of service is unmatched. 
                  It&apos;s a true differentiator in Austin&apos;s competitive luxury market.&rdquo;
                </p>
                <p className="text-sm text-gray-500">
                  — Michael Rodriguez, General Manager, The Independent
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">92%</p>
                  <p className="text-sm text-gray-600">Resident Adoption</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">4.9★</p>
                  <p className="text-sm text-gray-600">Service Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">$2.3M</p>
                  <p className="text-sm text-gray-600">Annual Volume</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              TAILORED FOR EVERY PROPERTY TYPE
            </h2>
            <p className="text-gray-600">
              Custom programs designed for luxury apartments, condos, and mixed-use developments
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">HIGH-RISE TOWERS</h3>
              <p className="text-sm text-gray-600">200+ units with concierge</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">LUXURY CONDOS</h3>
              <p className="text-sm text-gray-600">Boutique properties</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">MIXED-USE</h3>
              <p className="text-sm text-gray-600">Live, work, play concepts</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">SMART BUILDINGS</h3>
              <p className="text-sm text-gray-600">Tech-enabled properties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Tiers */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              FLEXIBLE PARTNERSHIP PROGRAMS
            </h2>
            <p className="text-gray-600">
              Revenue sharing models available for qualifying properties
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">BOUTIQUE</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$2,500<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>50-150 units</li>
                <li>10% resident discount</li>
                <li>Quarterly events</li>
                <li>Standard delivery</li>
                <li>Email support</li>
              </ul>
              <button className="w-full py-3 border border-gold-500 text-gold-600 hover:bg-gold-600 hover:text-white transition-all tracking-[0.1em]">
                INQUIRE
              </button>
            </div>

            <div className="bg-white border-2 border-gold-500 p-8 text-center relative transform scale-105 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-1 text-xs tracking-[0.1em]">
                RECOMMENDED
              </div>
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">PREMIUM</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$7,500<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>150-500 units</li>
                <li>15% resident discount</li>
                <li>Monthly events</li>
                <li>Express delivery</li>
                <li>Dedicated account manager</li>
                <li>Co-branded materials</li>
                <li>API integration</li>
              </ul>
              <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em]">
                GET STARTED
              </button>
            </div>

            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">ENTERPRISE</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">Custom</p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>500+ units or portfolio</li>
                <li>Custom discount tiers</li>
                <li>Weekly events</li>
                <li>White-glove service</li>
                <li>Revenue sharing</li>
                <li>Full integration</li>
                <li>Custom app features</li>
                <li>Exclusive selections</li>
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
            ELEVATE YOUR PROPERTY TODAY
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Join Austin&apos;s leading properties in offering residents an unmatched 
            luxury amenity. Our property management team will create a custom program 
            that drives satisfaction, retention, and NOI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
              REQUEST PROPOSAL
            </button>
            <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
              SCHEDULE DEMO
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Questions? Email us at{' '}
            <a href="mailto:properties@partyondelivery.com" className="text-gold-500 hover:text-gold-400">
              properties@partyondelivery.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}