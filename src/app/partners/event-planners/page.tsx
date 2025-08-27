'use client'

import React from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'

export default function EventPlannersPartnerPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/services/weddings/elegant-wedding-bar.webp"
          alt="Luxury Event Planning"
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
              AUSTIN ELEGANCE EVENTS
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Premier Event Planning Firm Partners with PartyOn Delivery
              <br />for Seamless Bar Services and Premium Beverage Programs
            </p>
            
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">500+</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">EVENTS ANNUALLY</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">15</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">YEARS EXPERIENCE</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">100%</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">CLIENT SATISFACTION</p>
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
              STREAMLINE YOUR EVENT EXECUTION
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Focus on creating magical moments while we handle every aspect of 
              beverage service with precision and elegance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">TURNKEY SOLUTIONS</h3>
              <p className="text-gray-600 mb-4">
                Complete bar service packages from intimate gatherings to grand galas
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Full-service bar setup
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Professional bartenders
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Custom cocktail menus
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">VOLUME PRICING</h3>
              <p className="text-gray-600 mb-4">
                Exclusive planner rates and transparent pricing for easy client quotes
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  25% planner discount
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Net pricing available
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Flexible payment terms
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
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">WHITE-LABEL SERVICE</h3>
              <p className="text-gray-600 mb-4">
                Seamless integration with your brand for a cohesive client experience
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Co-branded materials
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Invisible partnership
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Direct client billing
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold-500 text-sm tracking-[0.2em]">CASE STUDY</span>
              <h2 className="font-cormorant text-4xl mt-2 mb-6 tracking-[0.1em]">
                THE BARTON CREEK WEDDING
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                When faced with a last-minute venue change and 300 guests, Austin Elegance Events 
                trusted PartyOn Delivery to execute flawlessly under pressure.
              </p>
              
              <div className="border-l-4 border-gold-500 pl-6 mb-8">
                <p className="text-gray-700 italic mb-2">
                  &ldquo;PartyOn Delivery saved the day. Their team adapted to the new venue layout, 
                  created a custom cocktail menu inspired by the couple&apos;s story, and delivered 
                  service that had guests raving. They&apos;re now our exclusive beverage partner.&rdquo;
                </p>
                <p className="text-sm text-gray-500">
                  — Sarah Mitchell, Principal Planner, Austin Elegance Events
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">300</p>
                  <p className="text-sm text-gray-600">Guests Served</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">6</p>
                  <p className="text-sm text-gray-600">Signature Cocktails</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">5★</p>
                  <p className="text-sm text-gray-600">Client Review</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px]">
              <Image
                src="/images/services/weddings/signature-cocktails-closeup.webp"
                alt="Luxury Wedding Bar Service"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              COMPREHENSIVE EVENT SUPPORT
            </h2>
            <p className="text-gray-600">
              From intimate dinners to festival productions, we scale to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 p-6 text-center hover:border-gold-500 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">WEDDINGS</h3>
              <p className="text-sm text-gray-600">Full bar service for 50-500 guests</p>
            </div>
            
            <div className="border border-gray-200 p-6 text-center hover:border-gold-500 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">CORPORATE</h3>
              <p className="text-sm text-gray-600">Professional service for business events</p>
            </div>
            
            <div className="border border-gray-200 p-6 text-center hover:border-gold-500 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">GALAS</h3>
              <p className="text-sm text-gray-600">Fundraisers and charity events</p>
            </div>
            
            <div className="border border-gray-200 p-6 text-center hover:border-gold-500 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl mb-2">FESTIVALS</h3>
              <p className="text-sm text-gray-600">Large-scale event production</p>
            </div>
          </div>
        </div>
      </section>

      {/* Planner Resources */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              EXCLUSIVE PLANNER RESOURCES
            </h2>
            <p className="text-gray-600">
              Tools and support to make your job easier and your events extraordinary
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">DIGITAL TOOLS</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Online Quote Generator</strong>
                    <p className="text-sm text-gray-600">Instant pricing for any event size</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Cocktail Menu Builder</strong>
                    <p className="text-sm text-gray-600">Design custom drink menus with photos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Inventory Calculator</strong>
                    <p className="text-sm text-gray-600">Estimate quantities based on guest count</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Event Timeline Planner</strong>
                    <p className="text-sm text-gray-600">Coordinate bar service with event flow</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">PARTNER BENEFITS</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Dedicated Account Manager</strong>
                    <p className="text-sm text-gray-600">Single point of contact for all events</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Priority Booking</strong>
                    <p className="text-sm text-gray-600">Guaranteed availability for your dates</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Commission Program</strong>
                    <p className="text-sm text-gray-600">Earn up to 10% on referred events</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Vendor List Access</strong>
                    <p className="text-sm text-gray-600">Exclusive venue and vendor recommendations</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-cormorant text-4xl mb-6 tracking-[0.1em]">
            BECOME A PREFERRED PARTNER
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Join Austin&apos;s top event planners who trust PartyOn Delivery for flawless 
            execution. Apply today for exclusive planner benefits and preferred pricing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
              APPLY NOW
            </button>
            <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
              VIEW SAMPLE MENUS
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Already a partner? Access your portal at{' '}
            <a href="#" className="text-gold-500 hover:text-gold-400">
              planners.partyondelivery.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}