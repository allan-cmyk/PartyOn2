'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import AIConcierge from '@/components/AIConcierge';
import LuxuryCard from '@/components/LuxuryCard';

interface EventOption {
  id: string;
  title: string;
  description: string;
  image: string;
  guestRange: string;
  priceRange: string;
  link: string;
  features: string[];
}

export default function OrderPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  const eventOptions: EventOption[] = [
    {
      id: 'wedding',
      title: 'Weddings',
      description: 'Elegant bar service for your perfect day',
      image: '/images/services/weddings/signature-cocktails-rings.webp',
      guestRange: '50-300+',
      priceRange: '$1,500-$5,000+',
      link: '/weddings',
      features: [
        'Professional bartenders',
        'Custom cocktail menus',
        'Premium glassware',
        'Full setup & cleanup'
      ]
    },
    {
      id: 'boat',
      title: 'Boat Parties',
      description: 'Lake Travis luxury delivered to your vessel',
      image: '/images/services/boat-parties/luxury-yacht-deck.webp',
      guestRange: '10-50',
      priceRange: '$400-$2,000',
      link: '/boat-parties',
      features: [
        'Dock & water delivery',
        'Marine-safe packaging',
        'Coolers & ice included',
        'Sunset coordination'
      ]
    },
    {
      id: 'bach',
      title: 'Celebrations',
      description: 'Bachelor/ette parties & special occasions',
      image: '/images/services/bach-parties/bachelor-party-epic.webp',
      guestRange: '15-50',
      priceRange: '$500-$3,000',
      link: '/bach-parties',
      features: [
        'Multi-venue delivery',
        'Party concierge',
        'Custom themes',
        'VIP treatment'
      ]
    },
    {
      id: 'corporate',
      title: 'Corporate Events',
      description: 'Professional service for business occasions',
      image: '/images/services/corporate/penthouse-suite-setup.webp',
      guestRange: '25-500+',
      priceRange: '$1,000-$10,000+',
      link: '/corporate',
      features: [
        'Executive presentations',
        'Brand customization',
        'Professional staff',
        'Liability coverage'
      ]
    },
    {
      id: 'custom',
      title: 'Custom Orders',
      description: 'Build your own selection from our catalog',
      image: '/images/products/premium-spirits-wall.webp',
      guestRange: 'Any size',
      priceRange: 'No minimum', // '$100 minimum' - TESTING MODE
      link: '/products',
      features: [
        'Choose individual items',
        'Mix & match products',
        'Flexible quantities',
        'Same-day available'
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation forceScrolled={true} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              ORDER NOW
            </h1>
            <div className="w-24 h-px bg-gold-500 mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Start shopping our premium selection or let our AI concierge help you create the perfect order
            </p>
            
            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/products">
                <button className="px-12 py-4 bg-gray-900 text-white hover:bg-gold-500 transition-all duration-300 tracking-[0.15em] text-lg w-full sm:w-auto">
                  BROWSE PRODUCTS
                </button>
              </Link>
              <button 
                onClick={() => setIsConciergeOpen(true)}
                className="px-12 py-4 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 tracking-[0.15em] text-lg w-full sm:w-auto"
              >
                AI CONCIERGE
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              {/* TESTING MODE: No restrictions */}
              Order anytime • No minimum
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Options Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-3xl text-gray-900 mb-4 tracking-[0.1em]">
              CHOOSE YOUR PATH
            </h2>
            <div className="w-16 h-px bg-gold-500 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Order Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <LuxuryCard backgroundImage="/images/order/quick-order.webp">
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 text-gold-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6m0 0v2m0-2h2m-2 0h-2" />
                  </svg>
                  <h3 className="font-medium text-lg mb-2 tracking-[0.1em]">QUICK ORDER</h3>
                  <p className="text-gray-600 text-sm mb-4">Know what you want? Jump straight to shopping</p>
                  <Link href="/products">
                    <button className="px-6 py-2 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white font-semibold text-sm tracking-[0.1em] transition-all">
                      SHOP NOW →
                    </button>
                  </Link>
                </div>
              </LuxuryCard>
            </motion.div>

            {/* AI Concierge Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <LuxuryCard backgroundImage="/images/order/ai-concierge.webp">
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 text-gold-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="font-medium text-lg mb-2 tracking-[0.1em]">AI CONCIERGE</h3>
                  <p className="text-gray-600 text-sm mb-4">Get personalized recommendations for your event</p>
                  <button 
                    onClick={() => setIsConciergeOpen(true)}
                    className="px-6 py-2 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white font-semibold text-sm tracking-[0.1em] transition-all"
                  >
                    START CHAT →
                  </button>
                </div>
              </LuxuryCard>
            </motion.div>

            {/* Browse Packages Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <LuxuryCard backgroundImage="/images/order/event-packages.webp">
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 text-gold-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <h3 className="font-medium text-lg mb-2 tracking-[0.1em]">EVENT PACKAGES</h3>
                  <p className="text-gray-600 text-sm mb-4">Explore curated packages for every occasion</p>
                  <a href="#packages" className="inline-block px-6 py-2 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white font-semibold text-sm tracking-[0.1em] transition-all">
                    VIEW PACKAGES →
                  </a>
                </div>
              </LuxuryCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Event Selection Grid */}
      <section id="packages" className="py-16 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl text-gray-900 mb-4 tracking-[0.1em]">
              EVENT PACKAGES
            </h2>
            <div className="w-16 h-px bg-gold-500 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our curated packages designed for specific events, or build your own custom order
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventOptions.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white border ${
                  selectedEvent === event.id ? 'border-gold-600' : 'border-gray-200'
                } hover:border-gold-600 transition-all duration-300 cursor-pointer`}
                onClick={() => setSelectedEvent(event.id)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <h3 className="absolute bottom-4 left-6 font-serif text-2xl text-white tracking-[0.1em]">
                    {event.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 tracking-[0.1em]">GUESTS</span>
                      <span className="text-gray-900">{event.guestRange}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 tracking-[0.1em]">BUDGET</span>
                      <span className="text-gray-900">{event.priceRange}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {event.features.map((feature, i) => (
                      <div key={i} className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-gold-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={event.link}>
                    <button className="w-full py-3 bg-gold-500 text-white hover:bg-gold-600 transition-colors tracking-[0.15em] text-sm">
                      EXPLORE {event.title.toUpperCase()}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl text-gray-900 mb-4 tracking-[0.1em]">
              How It Works
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Choose Your Event',
                description: 'Select from our curated packages or build custom'
              },
              {
                step: '2',
                title: 'Select Products',
                description: 'Browse premium spirits, wines, and beers'
              },
              {
                step: '3',
                title: 'Schedule Delivery',
                description: 'Pick your date and delivery location'
              },
              {
                step: '4',
                title: 'Enjoy Service',
                description: 'Professional delivery and optional bartending'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-serif text-lg">
                  {item.step}
                </div>
                <h3 className="font-medium text-gray-900 mb-2 tracking-[0.1em]">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/images/party-on-logo.svg" 
                alt="Party On Delivery"
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier alcohol delivery and event service since 2020.
              </p>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">SERVICES</h4>
              <ul className="space-y-2">
                <li><Link href="/weddings" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Weddings</Link></li>
                <li><Link href="/boat-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Boat Parties</Link></li>
                <li><Link href="/bach-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Celebrations</Link></li>
                <li><Link href="/corporate" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Corporate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">SHOP</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">All Products</Link></li>
                <li><Link href="/collections" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Collections</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: info@partyondelivery.com</li>
                <li>Hours: 10am - 9pm (except Sundays)</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 PartyOn Delivery. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* AI Concierge */}
      <AIConcierge 
        mode="event-planning" 
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />
    </div>
  );
}