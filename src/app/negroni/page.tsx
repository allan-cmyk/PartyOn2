'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LuxuryJimmyPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      image: '/images/hero/luxury-wedding-estate-1.webp',
      title: 'PREMIUM SPIRITS',
      subtitle: 'Rare & exclusive bottles delivered'
    },
    {
      image: '/images/services/weddings/outdoor-bar-setup.webp',
      title: 'COCKTAIL KITS',
      subtitle: 'Craft cocktails with premium ingredients'
    },
    {
      image: '/images/services/boat-parties/luxury-yacht-deck.webp',
      title: 'PARTY PACKAGES',
      subtitle: 'Complete bar solutions delivered'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero - Jimmy Choo Style */}
      <section className="relative h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={slides[activeSlide].image}
              alt={slides[activeSlide].title}
              fill
              className="object-cover"
              priority
              quality={100}
            />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <div className="text-center pt-32">
            <motion.h1
              key={slides[activeSlide].title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-light text-white tracking-[0.2em] mb-4"
            >
              {slides[activeSlide].title}
            </motion.h1>
            <motion.p
              key={slides[activeSlide].subtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-white/80 tracking-[0.15em]"
            >
              {slides[activeSlide].subtitle}
            </motion.p>
          </div>

          {/* Slide Navigation */}
          <div className="flex justify-center space-x-3 pb-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-12 h-1 transition-all duration-500 ${
                  activeSlide === index ? 'bg-white w-24' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Text Block */}
            <div className="flex items-center justify-center p-16 md:p-24">
              <div className="max-w-md">
                <h2 className="text-4xl font-light mb-6 tracking-[0.05em]">AUSTIN&apos;S FINEST DELIVERY</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Premium alcohol delivery within 2 hours. From rare spirits to craft cocktails, we bring the bar to you 
                  with white-glove service for Austin&apos;s most discerning hosts.
                </p>
                <Link href="/services">
                  <button className="text-sm tracking-[0.2em] border-b border-gray-900 pb-1 hover:pb-2 transition-all">
                    DISCOVER MORE
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative h-[600px]">
              <Image
                src="/images/services/corporate/penthouse-suite-setup.webp"
                alt="Premium Service"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Reverse Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-[600px] order-2 md:order-1">
              <Image
                src="/images/products/premium-spirits-wall.webp"
                alt="Premium Selection"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Text Block */}
            <div className="flex items-center justify-center p-16 md:p-24 order-1 md:order-2">
              <div className="max-w-md">
                <h2 className="text-4xl font-light mb-6 tracking-[0.05em]">CURATED SELECTION</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Top-shelf spirits, rare whiskeys, champagnes, and craft cocktail essentials. 
                  Professional mixologists available. Delivery 7 days a week.
                </p>
                <Link href="/portfolio">
                  <button className="text-sm tracking-[0.2em] border-b border-gray-900 pb-1 hover:pb-2 transition-all">
                    VIEW COLLECTION
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Banner */}
      <section className="relative h-[70vh]">
        <Image
          src="/images/backgrounds/rooftop-terrace-elegant-1.webp"
          alt="Luxury Experience"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 h-full flex items-end justify-center pb-24">
          <div className="text-center text-white">
            <h2 className="text-5xl font-light mb-6 tracking-[0.15em]">DELIVERY IN 2 HOURS</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Same-day alcohol delivery across Austin. Premium spirits, cocktail kits, and party packages.
            </p>
            <Link href="/consultation">
              <button className="px-12 py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-500 tracking-[0.1em]">
                BEGIN YOUR JOURNEY
              </button>
            </Link>
            <Link href="/order-now">
              <button className="px-12 py-4 bg-white text-black hover:bg-gray-100 transition-all duration-500 tracking-[0.1em]">
                ORDER NOW
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-16 border-t">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <p className="text-2xl font-light tracking-[0.3em]">PARTYON</p>
              <p className="text-sm text-gray-600 mt-2">Premium Alcohol Delivery • Austin, Texas</p>
            </div>
            <div className="flex space-x-12">
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}