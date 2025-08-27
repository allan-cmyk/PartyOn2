'use client'

import React from 'react'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'

export default function HotelsResortsPartnerPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/backgrounds/rooftop-terrace-elegant-1.webp"
          alt="Luxury Hotel Bar"
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
              THE DRISKILL HOTEL
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Austin&apos;s Historic Landmark Partners with PartyOn Delivery for
              <br />Exclusive In-Room Amenities and Event Services
            </p>
            
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">137</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">YEARS OF HERITAGE</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">189</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">LUXURY SUITES</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">5★</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">GUEST RATING</p>
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
              ELEVATE YOUR GUEST EXPERIENCE
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transform your hospitality offerings with curated spirits, personalized service, 
              and seamless integration with your concierge team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">IN-ROOM AMENITIES</h3>
              <p className="text-gray-600 mb-4">
                Curated welcome packages, VIP minibars, and personalized selections based on guest preferences
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Presidential Suite champagne service
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Anniversary & celebration packages
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Custom minibar programs
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">EVENT SERVICES</h3>
              <p className="text-gray-600 mb-4">
                Full-service bar for galas, weddings, and corporate events with dedicated account management
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Ballroom & rooftop events
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Executive meeting packages
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Signature cocktail creation
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">CONCIERGE INTEGRATION</h3>
              <p className="text-gray-600 mb-4">
                Seamless ordering through your concierge desk with white-glove delivery service
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Direct concierge portal access
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Guest preference tracking
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Express 2-hour delivery
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
                NEW YEAR&apos;S EVE GALA SUCCESS
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &ldquo;PartyOn Delivery transformed our New Year&apos;s Eve celebration into an unforgettable 
                experience. Their team curated a bespoke champagne selection and provided seamless 
                service for over 500 guests across multiple ballrooms and our rooftop terrace.&rdquo;
              </p>
              <div className="border-l-4 border-gold-500 pl-6 mb-8">
                <p className="text-gray-700 italic mb-2">
                  &ldquo;The attention to detail and quality of service exceeded our highest expectations. 
                  Our guests are still talking about the signature cocktails.&rdquo;
                </p>
                <p className="text-sm text-gray-500">
                  — Alexandra Chen, Director of Events, The Driskill
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">500+</p>
                  <p className="text-sm text-gray-600">Guests Served</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">12</p>
                  <p className="text-sm text-gray-600">Custom Cocktails</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">98%</p>
                  <p className="text-sm text-gray-600">Guest Satisfaction</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px]">
              <Image
                src="/images/gallery/sunset-champagne-pontoon.webp"
                alt="New Year's Eve Celebration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              PARTNERSHIP PROGRAMS
            </h2>
            <p className="text-gray-600">
              Flexible solutions designed to match your property&apos;s unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">BOUTIQUE</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$5,000<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>Up to 50 rooms</li>
                <li>Basic minibar program</li>
                <li>Event support available</li>
                <li>Monthly account review</li>
                <li>Standard delivery times</li>
              </ul>
              <button className="w-full py-3 border border-gold-500 text-gold-600 hover:bg-gold-600 hover:text-white transition-all tracking-[0.1em]">
                LEARN MORE
              </button>
            </div>

            <div className="border-2 border-gold-500 p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-1 text-xs tracking-[0.1em]">
                MOST POPULAR
              </div>
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">LUXURY</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$15,000<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>Up to 200 rooms</li>
                <li>Premium minibar program</li>
                <li>Dedicated event team</li>
                <li>Weekly account review</li>
                <li>Express 2-hour delivery</li>
                <li>Custom cocktail development</li>
                <li>Staff training included</li>
              </ul>
              <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em]">
                GET STARTED
              </button>
            </div>

            <div className="border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">RESORT</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">Custom</p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>Unlimited rooms</li>
                <li>Full property integration</li>
                <li>Dedicated account team</li>
                <li>Daily service review</li>
                <li>On-demand delivery</li>
                <li>Exclusive selections</li>
                <li>Revenue sharing available</li>
                <li>Co-branded experiences</li>
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
            JOIN AUSTIN&apos;S PREMIER HOSPITALITY NETWORK
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Partner with PartyOn Delivery and provide your guests with an unparalleled 
            luxury experience. Our dedicated hospitality team is ready to customize a 
            program that perfectly aligns with your property&apos;s standards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
              SCHEDULE CONSULTATION
            </button>
            <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
              DOWNLOAD PARTNER GUIDE
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Or call our hospitality team directly at{' '}
            <a href="tel:512-555-0100" className="text-gold-500 hover:text-gold-400">
              (512) 555-0100
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}