'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'

export default function CorporateOfficesPartnerPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/services/corporate/executive-cocktail-hour.webp"
          alt="Corporate Event Service"
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
              ORACLE AUSTIN
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Tech Giant Partners with PartyOn Delivery for Premium
              <br />Corporate Events and Executive Entertainment
            </p>
            
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">2,500</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">EMPLOYEES</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">50+</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">EVENTS YEARLY</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">98%</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">SATISFACTION</p>
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
              IMPRESS CLIENTS, REWARD TEAMS
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Premium beverage services that reflect your company's commitment 
              to excellence and attention to detail
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">CLIENT ENTERTAINMENT</h3>
              <p className="text-gray-600 mb-4">
                Executive-level service for closing dinners, product launches, and VIP events
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  C-suite dinner parties
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Board meeting service
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Client appreciation events
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
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">TEAM BUILDING</h3>
              <p className="text-gray-600 mb-4">
                Memorable experiences that strengthen culture and celebrate achievements
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Holiday parties
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Summer celebrations
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Milestone events
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
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">GIFTING PROGRAMS</h3>
              <p className="text-gray-600 mb-4">
                Curated spirits and custom packages for clients and employees
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Executive gift sets
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Custom engraving
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Branded packaging
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
            <div className="relative h-[500px]">
              <Image
                src="/images/services/corporate/client-entertainment-rooftop.webp"
                alt="Corporate Event at Oracle"
                fill
                className="object-cover"
              />
            </div>
            
            <div>
              <span className="text-gold-500 text-sm tracking-[0.2em]">CASE STUDY</span>
              <h2 className="font-cormorant text-4xl mt-2 mb-6 tracking-[0.1em]">
                SXSW CLIENT SUMMIT SUCCESS
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                During SXSW 2024, Oracle Austin hosted 500 global clients for a three-day 
                summit featuring multiple networking events, each requiring unique beverage 
                experiences that reflected Austin's culture while maintaining corporate standards.
              </p>
              
              <div className="border-l-4 border-gold-500 pl-6 mb-8">
                <p className="text-gray-700 italic mb-2">
                  "PartyOn Delivery managed every detail flawlessly. From the welcome reception 
                  featuring local craft spirits to the closing gala with premium wines, they 
                  delivered experiences that impressed our most discerning clients."
                </p>
                <p className="text-sm text-gray-500">
                  — Rebecca Torres, VP of Events, Oracle Austin
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">500</p>
                  <p className="text-sm text-gray-600">Global Clients</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">12</p>
                  <p className="text-sm text-gray-600">Events</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">100%</p>
                  <p className="text-sm text-gray-600">On-Time Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Options */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              TAILORED CORPORATE SOLUTIONS
            </h2>
            <p className="text-gray-600">
              From tech startups to Fortune 500, we scale to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">REGULAR SERVICES</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Happy Hours</strong>
                    <p className="text-sm text-gray-600">Weekly team gatherings and casual Fridays</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Office Stock</strong>
                    <p className="text-sm text-gray-600">Premium spirits for executive areas</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Meeting Refreshments</strong>
                    <p className="text-sm text-gray-600">Wine and cocktail service for clients</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Lunch & Learns</strong>
                    <p className="text-sm text-gray-600">Educational events with beverage service</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-2xl mb-4 tracking-[0.1em]">SPECIAL EVENTS</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Product Launches</strong>
                    <p className="text-sm text-gray-600">Celebration events with signature cocktails</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Annual Galas</strong>
                    <p className="text-sm text-gray-600">Black-tie affairs with premium service</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Conference Support</strong>
                    <p className="text-sm text-gray-600">Multi-day events with various touchpoints</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gold-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong>Executive Retreats</strong>
                    <p className="text-sm text-gray-600">Off-site leadership events</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Packages */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              CORPORATE PARTNERSHIP PACKAGES
            </h2>
            <p className="text-gray-600">
              Flexible programs designed to support your company culture
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">STARTUP</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$2,500<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>Up to 100 employees</li>
                <li>Monthly happy hours</li>
                <li>15% corporate discount</li>
                <li>Basic event support</li>
                <li>Net 30 billing</li>
              </ul>
              <button className="w-full py-3 border border-gold-500 text-gold-600 hover:bg-gold-600 hover:text-white transition-all tracking-[0.1em]">
                LEARN MORE
              </button>
            </div>

            <div className="bg-white border-2 border-gold-500 p-8 text-center relative transform scale-105 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-1 text-xs tracking-[0.1em]">
                RECOMMENDED
              </div>
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">GROWTH</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$10,000<span className="text-base">/month</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>100-500 employees</li>
                <li>Weekly events</li>
                <li>20% corporate discount</li>
                <li>Dedicated account manager</li>
                <li>Priority booking</li>
                <li>Net 45 billing</li>
                <li>Custom cocktail creation</li>
              </ul>
              <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em]">
                GET STARTED
              </button>
            </div>

            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">ENTERPRISE</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">Custom</p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>500+ employees</li>
                <li>Unlimited events</li>
                <li>Best pricing available</li>
                <li>Executive team</li>
                <li>Guaranteed availability</li>
                <li>Net 60 billing</li>
                <li>Co-branded experiences</li>
                <li>Annual planning support</li>
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
            ELEVATE YOUR CORPORATE CULTURE
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Join leading Austin companies in creating memorable experiences that 
            attract talent, impress clients, and celebrate success. Let our corporate 
            team design a program that reflects your company's values and vision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
              SCHEDULE CONSULTATION
            </button>
            <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
              REQUEST PROPOSAL
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Contact our corporate team at{' '}
            <a href="mailto:corporate@partyondelivery.com" className="text-gold-500 hover:text-gold-400">
              corporate@partyondelivery.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}