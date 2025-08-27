'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'

export default function CountryClubsPartnerPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/lake-travis-yacht-sunset.webp"
          alt="Luxury Country Club"
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
              AUSTIN COUNTRY CLUB
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Premier Golf Club Partners with PartyOn Delivery for
              <br />Exclusive Member Benefits and Tournament Sponsorships
            </p>
            
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">1,200</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">MEMBERS</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">36</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">CHAMPIONSHIP HOLES</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-cormorant text-gold-500">125</p>
                <p className="text-sm text-gray-300 tracking-[0.1em]">YEARS OF TRADITION</p>
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
              ENHANCE YOUR MEMBER EXPERIENCE
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Premium beverage programs that reflect the exclusivity and tradition 
              of your club while delighting members and guests
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">MEMBER PRIVILEGES</h3>
              <p className="text-gray-600 mb-4">
                Exclusive access to rare spirits, member pricing, and priority service
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Members-only allocations
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Personal cellar programs
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Home delivery service
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">TOURNAMENT SUPPORT</h3>
              <p className="text-gray-600 mb-4">
                Full-service beverage sponsorship for golf tournaments and events
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  On-course beverage carts
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  19th hole celebrations
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Awards dinner service
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="border border-gray-200 p-8 hover:border-gold-500 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mb-4">
                <svg className="w-full h-full text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-cormorant text-2xl mb-3 tracking-[0.1em]">CLUB OPERATIONS</h3>
              <p className="text-gray-600 mb-4">
                Reliable supply chain for clubhouse bars, dining rooms, and pro shop
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Restaurant & bar supply
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Pro shop retail program
                </li>
                <li className="flex items-start">
                  <span className="text-gold-500 mr-2">•</span>
                  Locker room amenities
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
                THE MASTERS INVITATIONAL
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Austin Country Club's signature tournament elevated to new heights with 
                PartyOn Delivery's comprehensive beverage sponsorship and execution.
              </p>
              
              <div className="border-l-4 border-gold-500 pl-6 mb-8">
                <p className="text-gray-700 italic mb-2">
                  "The level of service and attention to detail was extraordinary. From the 
                  morning bloody mary bar to the champion's dinner featuring rare vintages, 
                  PartyOn Delivery made our tournament truly world-class."
                </p>
                <p className="text-sm text-gray-500">
                  — William Hartford, General Manager, Austin Country Club
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">144</p>
                  <p className="text-sm text-gray-600">Players</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">$50K</p>
                  <p className="text-sm text-gray-600">Raised for Charity</p>
                </div>
                <div>
                  <p className="text-3xl font-cormorant text-gold-500">5★</p>
                  <p className="text-sm text-gray-600">Event Rating</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px]">
              <Image
                src="/images/gallery/elegant-waterfront-dinner.webp"
                alt="Golf Tournament Celebration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Club Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl mb-4 tracking-[0.1em]">
              COMPREHENSIVE CLUB SERVICES
            </h2>
            <p className="text-gray-600">
              Everything you need for world-class hospitality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-xl mb-4 tracking-[0.1em]">GOLF OPERATIONS</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Beverage cart programs</li>
                <li>• Tournament bars</li>
                <li>• Practice facility service</li>
                <li>• Halfway house supply</li>
                <li>• Course sponsorships</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-xl mb-4 tracking-[0.1em]">DINING & EVENTS</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Main dining room</li>
                <li>• Casual grill service</li>
                <li>• Member events</li>
                <li>• Holiday celebrations</li>
                <li>• Wine dinners</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-xl mb-4 tracking-[0.1em]">MEMBER SERVICES</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Personal wine lockers</li>
                <li>• Home delivery</li>
                <li>• Special orders</li>
                <li>• Gift programs</li>
                <li>• Tasting events</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-xl mb-4 tracking-[0.1em]">POOL & TENNIS</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Poolside bar service</li>
                <li>• Cabana programs</li>
                <li>• Tennis tournament bars</li>
                <li>• Summer camps</li>
                <li>• Family events</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-xl mb-4 tracking-[0.1em]">SPECIAL OCCASIONS</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Member weddings</li>
                <li>• Corporate outings</li>
                <li>• Charity galas</li>
                <li>• Award banquets</li>
                <li>• Anniversary celebrations</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h3 className="font-cormorant text-xl mb-4 tracking-[0.1em]">RETAIL & GIFTING</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Pro shop offerings</li>
                <li>• Tournament prizes</li>
                <li>• Member gifts</li>
                <li>• Holiday packages</li>
                <li>• Custom engraving</li>
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
              CLUB PARTNERSHIP PROGRAMS
            </h2>
            <p className="text-gray-600">
              Tailored solutions for private clubs of every size
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">GOLF CLUB</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$15K<span className="text-base">/month minimum</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>Up to 500 members</li>
                <li>Course & clubhouse supply</li>
                <li>Member discount program</li>
                <li>Quarterly wine dinners</li>
                <li>Tournament support</li>
              </ul>
              <button className="w-full py-3 border border-gold-500 text-gold-600 hover:bg-gold-600 hover:text-white transition-all tracking-[0.1em]">
                INQUIRE
              </button>
            </div>

            <div className="bg-white border-2 border-gold-500 p-8 text-center relative transform scale-105 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold-500 text-white px-4 py-1 text-xs tracking-[0.1em]">
                MOST POPULAR
              </div>
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">COUNTRY CLUB</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">$35K<span className="text-base">/month minimum</span></p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>500-1500 members</li>
                <li>Full facility coverage</li>
                <li>Premium member benefits</li>
                <li>Monthly events</li>
                <li>Dedicated account team</li>
                <li>Custom wine program</li>
                <li>Revenue sharing available</li>
              </ul>
              <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em]">
                GET STARTED
              </button>
            </div>

            <div className="bg-white border border-gray-200 p-8 text-center">
              <h3 className="font-cormorant text-2xl mb-2 tracking-[0.1em]">RESORT CLUB</h3>
              <p className="text-gold-500 text-3xl font-cormorant mb-4">Custom</p>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>1500+ members</li>
                <li>Multiple facilities</li>
                <li>Exclusive allocations</li>
                <li>Weekly programming</li>
                <li>Executive partnership</li>
                <li>Private label options</li>
                <li>Full integration</li>
                <li>Board presentations</li>
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
            ELEVATE YOUR CLUB'S DISTINCTION
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Partner with PartyOn Delivery to provide your members with exceptional 
            beverage experiences that match the prestige of your club. Our dedicated 
            club services team understands the unique needs of private clubs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-8 py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em]">
              REQUEST CONSULTATION
            </button>
            <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 transition-all tracking-[0.15em]">
              MEMBER BENEFITS GUIDE
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Contact our club services team at{' '}
            <a href="tel:512-555-0300" className="text-gold-500 hover:text-gold-400">
              (512) 555-0300
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}