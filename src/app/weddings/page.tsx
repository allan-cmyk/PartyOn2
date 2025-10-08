'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import LuxuryCard from '@/components/LuxuryCard';

export default function WeddingsPage() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setShowStickyBar(window.scrollY > heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const heroImages = [
    { src: '/images/services/weddings/outdoor-bar-setup.webp', alt: 'Elegant Wedding Bar Setup' },
    { src: '/images/hero/wedding-hero-vineyard.webp', alt: 'Texas Hill Country vineyard wedding' },
    { src: '/images/hero/wedding-hero-ballroom.webp', alt: 'Driskill Hotel ballroom reception' },
    { src: '/images/hero/wedding-hero-garden.webp', alt: 'Laguna Gloria garden wedding' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  const packages = [
    {
      name: "Intimate Ceremony",
      price: "From $1,299",
      description: "Perfect for smaller gatherings with distinguished service",
      features: [
        "2 Professional bartenders",
        "Premium spirit selection",
        "Champagne toast service",
        "Up to 50 guests",
        "4 hours of service",
        "Setup & breakdown included"
      ],
      featured: false
    },
    {
      name: "Classic Reception",
      price: "From $2,499",
      description: "Our most popular package for traditional celebrations",
      features: [
        "4 Professional bartenders",
        "Full premium bar selection",
        "Signature cocktail menu",
        "Up to 150 guests",
        "6 hours of service",
        "Multiple bar stations",
        "Complete setup & breakdown"
      ],
      featured: true
    },
    {
      name: "Grand Celebration",
      price: "From $4,999",
      description: "Luxurious service for unforgettable celebrations",
      features: [
        "6 Master bartenders",
        "Ultra-premium spirits",
        "Custom cocktail creation",
        "Up to 300 guests",
        "8 hours of service",
        "Multiple luxury bar stations",
        "Gold-rimmed glassware",
        "Dedicated service captain"
      ],
      featured: false
    }
  ];

  return (
    <div className="bg-white">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden pt-20">
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
                e.currentTarget.src = '/images/services/weddings/outdoor-bar-setup.webp';
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900/50" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
        >
          <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
            <span className="block text-white">Your Austin Wedding,</span>
            <span className="block text-gold-400">PERFECTLY SERVED</span>
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] text-gray-200 mb-8">
            Curated bar service with venue coordination, cold delivery, and TABC-certified bartenders for Austin, Hill Country, and Lake Travis weddings.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/weddings/products">
              <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm font-medium">
                ORDER NOW
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm font-medium">
                SCHEDULE 15-MIN PLANNING CALL
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-300 mt-4 tracking-[0.05em]">
            Licensed & insured • 72-hour notice recommended • 500+ Austin weddings served
          </p>
        </motion.div>
        
        {/* Hero Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
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
      </section>

      {/* Choose Your Path */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Choose Your Path
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Delivery-Only Path */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em] text-center">
                Delivery-Only
              </h3>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Curated spirits, beer, wine delivered cold to your venue
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  You handle setup or use your own bartender
                </li>
              </ul>
              <Link href="/order">
                <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm font-medium">
                  ORDER NOW
                </button>
              </Link>
            </motion.div>

            {/* Full-Service Path */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 rounded-lg shadow-lg border-2 border-gold-600"
            >
              <div className="text-center mb-4">
                <span className="text-gold-600 text-sm tracking-[0.15em] font-medium">MOST POPULAR</span>
              </div>
              <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em] text-center">
                Full-Service
              </h3>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete bar service with TABC-certified bartenders
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Setup, service, and breakdown included
                </li>
              </ul>
              <Link href="/contact">
                <button className="w-full py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm font-medium">
                  SCHEDULE A CONSULTATION
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 tracking-[0.05em]">
              Trusted for Lake Travis, Hill Country, and downtown Austin venues since 2020
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Why Austin Couples Book Us
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Seamless Venue Coordination
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We work directly with your venue for smooth delivery and setup
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                TABC-Certified Professionals
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Licensed bartenders through our vetted partner network
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Curated Local Selection
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin favorites plus premium spirits, perfectly chilled
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Lake Travis Expertise
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Specialized routes and timing for Hill Country and lakeside venues
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Bar Service Packages (Full-Service)
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Thoughtfully designed packages to match your celebration size and style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <LuxuryCard
                key={pkg.name}
                featured={pkg.featured}
                index={index}
                className="rounded-lg"
              >
                <div className="p-8">
                  {pkg.featured && (
                    <div className="text-center mb-4">
                      <span className="text-gold-600 text-sm tracking-[0.15em]">MOST POPULAR</span>
                    </div>
                  )}
                  <h3 className="font-serif text-2xl text-gray-900 mb-2 tracking-[0.1em] text-center">
                    {pkg.name}
                  </h3>
                  <p className="text-4xl text-gold-600 font-semibold text-center mb-4">
                    {pkg.price}
                  </p>
                  <p className="text-gray-600 text-center mb-8">
                    {pkg.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-4 h-4 text-gold-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <button className={`w-full py-3 tracking-[0.15em] text-sm transition-all duration-300 ${
                      pkg.featured
                        ? 'bg-gold-600 text-white hover:bg-gold-700'
                        : 'border border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white'
                    }`}>
                      PLAN THIS PACKAGE (CONSULTATION)
                    </button>
                  </Link>
                </div>
              </LuxuryCard>
            ))}
          </div>

          {/* Delivery-Only Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center max-w-4xl mx-auto"
          >
            <p className="text-lg text-gray-700 mb-6 tracking-[0.05em]">
              <strong>Just need delivery?</strong> Build your cart in minutes and we&apos;ll coordinate drop-off with your venue.
            </p>
            <Link href="/order">
              <button className="px-8 py-3 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm font-medium">
                ORDER DELIVERY-ONLY
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Celebration Gallery
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "/images/services/weddings/outdoor-bar-setup.webp", alt: "Outdoor Bar Setup" },
              { src: "/images/services/weddings/hill-country-spirits-display.webp", alt: "Hill Country Display" },
              { src: "/images/services/weddings/signature-cocktails-closeup.webp", alt: "Signature Cocktails" },
            ].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative h-80 overflow-hidden group"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Do you provide bartenders?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, via vetted TABC-certified partners for full-service packages.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                How far in advance should we book?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                72 hours minimum recommended; peak wedding dates fill fast.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Do you deliver to Lake Travis/Hill Country venues?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we specialize in Austin, Hill Country, and Lake Travis locations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                What about glassware & equipment?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Included with full-service packages; disposable upgrades available for delivery-only.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Are you licensed & insured?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, fully licensed and insured for events.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                Already have a bartender?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Perfect! Use our Delivery-Only option for curated alcohol delivery.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
              &ldquo;PartyOn made our Lake Travis wedding absolutely perfect. The bartenders 
              were professional, the drinks were exceptional, and every detail was handled 
              with care. Our guests are still raving about the signature cocktails!&rdquo;
            </p>
            <p className="text-gray-900 font-light tracking-[0.1em]">
              Sarah & Michael Thompson
            </p>
            <p className="text-gold-600 text-sm tracking-[0.1em]">
              Westlake Hills Wedding, October 2023
            </p>
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
                Austin&apos;s premier wedding bar service since 2020.
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
            <p className="text-gray-500 text-sm">© 2024 PartyOn Delivery. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden"
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 tracking-[0.05em]">
                    Planning a wedding?
                  </p>
                  <p className="text-xs text-gray-600">
                    2-minute form • Fast availability check
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href="/order">
                    <button className="px-4 py-2 bg-gold-600 text-white text-xs tracking-[0.1em] font-medium">
                      ORDER NOW
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button className="px-4 py-2 border border-gold-600 text-gold-600 text-xs tracking-[0.1em] font-medium">
                      SCHEDULE CALL
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}