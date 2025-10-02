'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';

export default function HomePage() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const heroImages = [
    { src: '/images/hero/austin-skyline-hero.webp', alt: 'Austin Skyline' },
    { src: '/images/hero/homepage-hero-sunset.webp', alt: 'Austin sunset from Lady Bird Lake' },
    { src: '/images/hero/homepage-hero-rooftop.webp', alt: 'Rooftop bar in downtown Austin' },
    { src: '/images/hero/homepage-hero-luxury.webp', alt: 'Luxury penthouse bar setup' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentHeroIndex].src}
              alt={heroImages[currentHeroIndex].alt}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                // Fallback to original image if new ones don't exist yet
                e.currentTarget.src = '/images/hero/austin-skyline-hero.webp';
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />
        
        {/* Hero Dots Navigation */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentHeroIndex ? 'bg-gold-400 w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
        >
          <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
            <span className="block text-white">Drinks, Ice, Bar Setups</span>
            <span className="block text-gold-400">Delivered on Time</span>
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] mb-8 text-gray-200">
            From house parties to Lake Travis weddings—everything arrives cold with ice, cups, and mixers handled.
          </p>
          <div className="text-sm text-gray-300 mb-8 tracking-[0.05em]">
            Licensed • Insured • TABC-certified • 5.0★ on Google
          </div>
          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-all duration-300 tracking-[0.15em] text-sm">
                ORDER NOW
              </button>
            </Link>
            <Link href="/order">
              <button className="px-10 py-4 border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm">
                PLAN MY EVENT
              </button>
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => scrollToSection('experience')}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Choose Your Path Fork */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Choose Your Path
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Delivery Now */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                Delivery Now <span className="text-gold-600">(fastest)</span>
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">Build your cart in minutes—beer, spirits, cocktail kits, ice & disposables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">Everything arrives cold with coordinated handoff</span>
                </li>
              </ul>
              <Link href="/products">
                <button className="w-full px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                  SHOP BEST SELLERS
                </button>
              </Link>
            </motion.div>

            {/* Plan an Event */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                Plan an Event <span className="text-gold-600">(concierge)</span>
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">Full wedding, boat party, and corporate bar coordination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">Optional TABC-certified bartender staffing via vetted partners</span>
                </li>
              </ul>
              <Link href="/contact">
                <button className="w-full px-8 py-4 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  SCHEDULE A 15-MIN PLANNING CALL
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 text-sm tracking-[0.05em]">
              Austin locals serving Downtown to Lake Travis since 2023
            </p>
          </motion.div>
        </div>
      </section>

      {/* Top Picks Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Top Picks (2-minute order)
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600">Change quantities at checkout</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {[
              { title: 'Party Packs', desc: 'Pre-curated bundles for 10-50 guests' },
              { title: 'Premium Spirits', desc: 'Tito\'s, Don Julio, top-shelf favorites' },
              { title: 'Craft Beer', desc: 'Local Austin breweries + crowd favorites' },
              { title: 'Wine Selection', desc: 'Prosecco, rosé, reds for every occasion' },
              { title: 'Cocktail Kits', desc: 'Everything for margaritas, old fashioned, signatures' },
              { title: 'Ice & Disposables', desc: 'Cups, napkins, stirrers, coolers' },
              { title: 'Coolers & Gear', desc: 'Keep drinks cold all day long' },
              { title: 'Party Essentials', desc: 'Complete setup packages' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.05em]">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {item.desc}
                </p>
                <button className="w-full px-4 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors text-sm tracking-[0.1em]">
                  ADD TO CART
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/products" className="text-gold-600 hover:text-gold-700 tracking-[0.1em] text-sm transition-colors">
              See all best sellers →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Austin Books Party On */}
      <section id="experience" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Why Austin books Party On
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "On-time, cold delivery",
                description: "Ice, cups, mixers handled so you don't stress",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Local concierge",
                description: "We know venues, marinas, and event planners personally",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )
              },
              {
                title: "Licensed & insured",
                description: "TABC-certified service you can trust completely",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "No overbuy anxiety",
                description: "Weddings: 100% refund on unopened",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((feature, index) => {
              const backgroundImages = [
                '/images/experience/curated-spirits-display.webp',
                '/images/experience/delivery-driver-premium.webp',
                '/images/experience/five-star-service.webp',
                '/images/experience/premium-guarantee.webp'
              ];
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="relative overflow-hidden rounded-lg group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 -z-10">
                    <Image
                      src={backgroundImages[index]}
                      alt={feature.title}
                      fill
                      className="object-cover opacity-30 scale-125 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-40"
                      onError={(e) => {
                        // Use a fallback texture if the specific image doesn't exist
                        const fallbacks = [
                          '/images/textures/gold-liquid-abstract.webp',
                          '/images/textures/crystal-ice-texture.webp',
                          '/images/textures/whiskey-amber-swirl.webp'
                        ];
                        e.currentTarget.src = fallbacks[index % fallbacks.length];
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/90" />
                    {/* Add subtle gold shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold-600/0 via-gold-600/5 to-gold-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                  
                  <div className="relative p-8 text-center">
                    <div className="mb-6">{feature.icon}</div>
                    <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Signature Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              For whatever you&apos;re planning, get the perfect drink menu on easy mode
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          </motion.div>

          {/* Service 1: Weddings */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div className="relative h-96 overflow-hidden">
              <Image
                src="/images/services/weddings/outdoor-bar-setup.webp"
                alt="Wedding Bar Service"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-transparent" />
            </div>
            <div className="lg:pl-12">
              <h3 className="font-serif text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                Weddings
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Make your special day stress-free with coordinated bar service and setup.
              </p>
              <div className="bg-gold-50 border border-gold-200 rounded p-3 mb-6">
                <span className="text-gold-700 text-sm font-medium">100% refund on unopened</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/weddings">
                  <button className="px-6 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                    EXPLORE PACKAGES
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-6 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.1em] text-sm">
                    PLAN MY WEDDING
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Service 2: Boat Parties */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div className="lg:pr-12 order-2 lg:order-1">
              <h3 className="font-serif text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                Boat Parties
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lake Travis essentials delivered dockside—drinks, ice, and coolers ready to go.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/boat-parties">
                  <button className="px-6 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                    ORDER LAKE DAY ESSENTIALS
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-6 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.1em] text-sm">
                    PLAN A YACHT BAR
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative h-96 overflow-hidden order-1 lg:order-2">
              <Image
                src="/images/services/boat-parties/luxury-yacht-deck.webp"
                alt="Boat Party Service"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-gray-900/20 to-transparent" />
            </div>
          </motion.div>

          {/* Service 3: Corporate Events */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="relative h-96 overflow-hidden">
              <Image
                src="/images/services/corporate/penthouse-suite-setup.webp"
                alt="Corporate Event Service"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-transparent" />
            </div>
            <div className="lg:pl-12">
              <h3 className="font-serif text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                Corporate
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Professional office bars and team events with invoice billing available.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/corporate">
                  <button className="px-6 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm">
                    ORDER OFFICE BAR
                  </button>
                </Link>
                <Link href="/order">
                  <button className="px-6 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.1em] text-sm">
                    BOOK A CORPORATE CONSULT
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Austin Coverage */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Serving Austin&apos;s Finest
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From Lake Travis to Downtown, we deliver excellence to every corner of Austin
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                Downtown & Central
              </h3>
              <ul className="space-y-3">
                {['Rainey Street', '6th Street', 'The Domain', 'Hyde Park', 'South Congress', 'East Austin'].map((area) => (
                  <li key={area} className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {area}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                Lake & Hills
              </h3>
              <ul className="space-y-3">
                {['Lake Travis', 'Westlake Hills', 'Bee Cave', 'Dripping Springs', 'Lakeway', 'Spicewood'].map((area) => (
                  <li key={area} className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {area}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Client Testimonials
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                text: "Party On saved our wedding weekend. Everything was perfectly chilled and the setup was flawless.",
                author: "Sarah M.",
                role: "Austin Wedding, October"
              },
              {
                text: "Best boat party delivery on Lake Travis. They know exactly where to find us.",
                author: "Mike T.",
                role: "Lake Travis Regular, Summer"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <p className="text-gray-900 font-light tracking-[0.1em]">
                  {testimonial.author}
                </p>
                <p className="text-gold-600 text-sm tracking-[0.1em]">
                  {testimonial.role}
                </p>
                {index < 1 && <div className="w-24 h-px bg-gray-300 mx-auto mt-12" />}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center pt-8 border-t border-gray-200"
            >
              <p className="text-gray-600 tracking-[0.05em]">
                Open since 2023 • Thousands served • 5.0★ on Google
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              How it works
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Tell us date & drop-off window",
                description: "Quick availability check"
              },
              {
                step: "2",
                title: "Choose Delivery Now or Plan an Event",
                description: "Fast order or full coordination"
              },
              {
                step: "3",
                title: "We coordinate logistics",
                description: "Venue/Airbnb/office/boat handoff arranged"
              },
              {
                step: "4",
                title: "Everything arrives cold",
                description: "Celebrate stress-free"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gold-600 text-white rounded-full flex items-center justify-center text-xl font-light mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.05em]">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas - Logistics Help */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              We Handle the Logistics
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              Austin, Lake Travis, Hill Country coverage with specialized delivery expertise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Hotel bell desk handoff",
                description: "No waiting in lobby; we coordinate with staff"
              },
              {
                title: "Airbnb door code coordination",
                description: "Seamless check-in delivery timing"
              },
              {
                title: "Dockside or cove handoff",
                description: "Lake Travis marina and boat delivery expertise"
              },
              {
                title: "Office load-in / invoice billing",
                description: "Corporate-friendly logistics and payment"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini-FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Quick Questions
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="space-y-8">
            {[
              {
                question: "Do you deliver to venues, Airbnbs, offices, or boats?",
                answer: "Yes—coordinated handoff so you're not waiting around."
              },
              {
                question: "How far ahead should I book?",
                answer: "72 hours recommended; peak dates fill fast so book early."
              },
              {
                question: "Can you staff bartenders?",
                answer: "Yes via vetted TABC-certified partners for full-service events."
              },
              {
                question: "Do you bring ice and disposables?",
                answer: "Yes—add cups, napkins, stirrers, and ice to your cart."
              },
              {
                question: "Refunds on unopened items for weddings?",
                answer: "100% refund policy—we want your day perfect, not wasteful."
              },
              {
                question: "Are you licensed and insured?",
                answer: "Yes—TABC certified + $2M insurance. Fully licensed operation."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 border border-gray-200"
              >
                <h3 className="font-medium text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-white mb-6 tracking-[0.1em]">
              Ready to stock your party?
            </h2>
            <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
              2-minute order • Fast availability check • (737) 371-9700
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/products">
                <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                  ORDER NOW
                </button>
              </Link>
              <Link href="/order">
                <button className="px-10 py-4 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  PLAN MY EVENT
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/images/POD Logo 2025.svg" 
                alt="Party On Delivery"
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier alcohol delivery and event service since 2023.
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
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">COMPANY</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">About</Link></li>
                <li><Link href="/delivery-areas" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Delivery Areas</Link></li>
                <li><Link href="/faqs" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: info@partyondelivery.com</li>
                <li>Hours: 10AM - 9PM (except Sundays)</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2025 PartyOn Delivery. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}