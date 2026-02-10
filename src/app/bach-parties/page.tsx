'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; // Kept for carousel only
import Navigation from "@/components/Navigation";
import HeroOverlay from '@/components/HeroOverlay';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import BachPartiesSchemas from '@/components/seo/BachPartiesSchemas';
import { trackPageView, ANALYTICS_EVENTS } from '@/lib/analytics/track';

export default function BachPartiesPage() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Track page view on mount
  useEffect(() => {
    trackPageView(ANALYTICS_EVENTS.VIEW_BACH_PARTIES, '/bach-parties', 'Bach Party Delivery Service');
  }, []);

  const heroImages = [
    { src: '/images/services/bach-parties/bachelor-party-epic.webp', alt: 'Epic bachelor party celebration' },
    { src: '/images/hero/bach-hero-rainey.webp', alt: 'Rainey Street nightlife' },
    { src: '/images/hero/bach-hero-party-bus.webp', alt: 'Luxury party bus' },
    { src: '/images/hero/bach-hero-brewery.webp', alt: 'Austin brewery celebration' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  const topPicks = [
    {
      name: "Austin Bach Starter",
      price: "$299",
      savings: "Save $50",
      description: "Everything for 6-8 people to pregame before hitting 6th Street",
      items: [
        "1x Tito's Vodka (750ml)",
        "1x Don Julio Blanco (750ml)",
        "6x White Claw Variety Pack",
        "Mixers: Cranberry, OJ, Lime juice",
        "Party cups & napkins"
      ],
      cta: "ORDER IN 30 SECONDS",
      featured: false
    },
    {
      name: "Lake Travis Pack",
      price: "$499",
      savings: "Save $75",
      description: "The boat party essentials - cold delivery to any dock or rental house",
      items: [
        "2x Tito's Vodka (750ml)",
        "1x Casamigos Blanco (750ml)",
        "12x White Claw + 12x Truly",
        "Full mixer set + ice packs",
        "Waterproof cooler included"
      ],
      cta: "ORDER IN 30 SECONDS",
      featured: true
    },
    {
      name: "Rainey Street Crawler",
      price: "$399",
      savings: "Save $60",
      description: "Perfect pre-gaming setup for hitting the Rainey Street bars",
      items: [
        "1x Tito's Vodka (750ml)",
        "1x Espolòn Tequila (750ml)",
        "1x Jameson Irish Whiskey (750ml)",
        "18x assorted seltzers",
        "Energy drinks & mixers"
      ],
      cta: "ORDER IN 30 SECONDS",
      featured: false
    }
  ];

  return (
    <div className="bg-white">
      {/* SEO Schemas - Server-rendered for crawlers */}
      <BachPartiesSchemas />

      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[100vh] pt-32 pb-32 md:pt-24 md:pb-24 flex items-center justify-center overflow-hidden">
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
              sizes="100vw"
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.src = '/images/services/bach-parties/bachelor-party-epic.webp';
              }}
            />
          </motion.div>
        </AnimatePresence>
        <HeroOverlay variant="luxury" />
        
        {/* Hero Dots Navigation */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentHeroIndex ? 'bg-brand-yellow w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        <div className="hero-fade-in relative text-center text-white z-10 max-w-4xl mx-auto px-6 md:px-8">
          <h1 className="font-heading font-light text-5xl md:text-7xl mb-6 tracking-[0.08em]">
            Zero Store Runs for
            <span className="block text-brand-yellow mt-2">AUSTIN BACH GROUPS</span>
          </h1>
          <div className="w-24 h-px bg-brand-yellow mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] text-gray-200 mb-8">
            Cold delivery with precise timing to your hotel, Airbnb, party bus, or boat—everything ready to pour.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/bach-parties/products">
              <button className="px-8 py-4 bg-brand-yellow text-gray-900 hover:bg-yellow-600 transition-colors tracking-[0.08em] text-sm font-medium">
                ORDER NOW
              </button>
            </Link>
            <a href="tel:7373719700">
              <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 tracking-[0.08em] text-sm font-medium">
                SCHEDULE 15-MIN PLANNING CALL
              </button>
            </a>
          </div>
          <p className="text-sm text-gray-300 mt-4 tracking-[0.05em]">
            TABC-licensed • Fully insured • 1000+ Deliveries, 5.0★
          </p>
        </div>
      </section>

      {/* Choose Your Path */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
            <h2 className="font-heading font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Choose Your Path
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Two ways to get exactly what your bach group needs—both guaranteed cold and on time.
            </p>
          </ScrollRevealCSS>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Delivery-Only Path */}
            <ScrollRevealCSS duration={800} y={20} delay={200} className="bg-white rounded-lg p-8 shadow-lg border-2 border-brand-yellow relative">
              <div className="absolute -top-4 left-8 bg-brand-yellow text-white px-4 py-2 rounded-full text-sm font-medium tracking-wider">
                MOST POPULAR
              </div>
              <h3 className="font-heading text-2xl md:text-3xl text-gray-900 mb-4 tracking-[0.1em]">
                Delivery-Only
                <span className="block text-lg text-gray-600 font-sans tracking-normal">(fastest)</span>
              </h3>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Order from our curated bach party bundles
                </li>
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Cold delivery to your exact location
                </li>
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  48-hour advance booking
                </li>
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Text updates with driver ETA
                </li>
              </ul>
              <button className="w-full bg-brand-yellow text-white font-medium py-4 px-6 rounded-lg hover:bg-yellow-600 transition-colors tracking-[0.1em]">
                ORDER NOW
              </button>
            </ScrollRevealCSS>

            {/* Concierge Path */}
            <ScrollRevealCSS duration={800} y={20} delay={400} className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="font-heading text-2xl md:text-3xl text-gray-900 mb-4 tracking-[0.1em]">
                Concierge / Custom
                <span className="block text-lg text-gray-600 font-sans tracking-normal">(full-service)</span>
              </h3>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Custom bar setup and mixers
                </li>
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Multi-location coordination
                </li>
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Bartender and server options
                </li>
                <li className="flex items-start">
                  <span className="text-brand-yellow mr-3 mt-1">•</span>
                  Same-day availability
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white font-medium py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors tracking-[0.1em]">
                SCHEDULE 15-MIN PLANNING CALL
              </button>
            </ScrollRevealCSS>
          </div>
        </div>
      </section>

      {/* Austin Bach Party Logistics */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
            <h2 className="font-heading font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              We Deliver Everywhere Bach Groups Go
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Cold alcohol delivered to any Austin location with 48-hour notice. Here&apos;s what bach groups book most.
            </p>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                area: "Downtown Hotels",
                details: "Hilton, Fairmont, JW Marriott",
                deliveryInfo: "Lobby delivery • 48hr notice",
                minOrder: "$150 minimum",
                popular: true
              },
              {
                area: "Rainey Street Airbnbs",
                details: "Historic houses • Walking to bars",
                deliveryInfo: "Front door • Park easily",
                minOrder: "$100 minimum",
                popular: true
              },
              {
                area: "Lake Travis Rentals",
                details: "Lakefront houses • Boat access",
                deliveryInfo: "Dock or house delivery",
                minOrder: "$200 minimum",
                popular: false
              },
              {
                area: "Party Buses",
                details: "Coordination with driver",
                deliveryInfo: "Meet at pickup location",
                minOrder: "$150 minimum",
                popular: false
              },
              {
                area: "East Austin Studios",
                details: "Loft spaces • Photo venues",
                deliveryInfo: "Building access required",
                minOrder: "$100 minimum",
                popular: false
              },
              {
                area: "Hill Country Venues",
                details: "Wineries • Event spaces",
                deliveryInfo: "Venue coordination",
                minOrder: "$300 minimum",
                popular: false
              }
            ].map((location, index) => (
              <ScrollRevealCSS
                key={location.area}
                duration={800}
                y={20}
                delay={index * 100}
                className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
                  location.popular ? 'border-brand-yellow' : 'border-gray-200'
                }`}
              >
                {location.popular && (
                  <div className="mb-4">
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <h3 className="font-heading text-lg text-gray-900 mb-2 tracking-[0.1em]">
                  {location.area}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {location.details}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-brand-yellow mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location.deliveryInfo}
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-brand-yellow mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {location.minOrder}
                  </div>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
          
          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="font-heading text-xl text-gray-900 mb-4 tracking-[0.1em]">
              Not Sure About Timing or Location?
            </h3>
            <p className="text-gray-600 mb-6">
              Our bach party coordinators know Austin like the back of their hand. Get a custom delivery plan.
            </p>
            <Link href="/contact">
              <button className="bg-brand-yellow text-white px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors tracking-[0.1em]">
                TALK TO A COORDINATOR
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bach-Specific Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
            <h2 className="font-heading font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              What Bach Groups Tell Us
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real outcomes from 500+ Austin bach parties we&apos;ve delivered to over the past 3 years.
            </p>
          </ScrollRevealCSS>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollRevealCSS duration={800} y={20} delay={100} className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl text-gray-900 mb-4 tracking-[0.1em]">
                &ldquo;Saved Us 4+ Hours&rdquo;
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No Walmart runs, no gas station stops, no warm beer crisis at 2 PM. Everything cold and ready when you arrive.
              </p>
            </ScrollRevealCSS>

            <ScrollRevealCSS duration={800} y={20} delay={200} className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl text-gray-900 mb-4 tracking-[0.1em]">
                &ldquo;Zero Group Drama&rdquo;
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No arguing about who pays for what or who&apos;s buying the next round. Everyone knows the plan and cost upfront.
              </p>
            </ScrollRevealCSS>

            <ScrollRevealCSS duration={800} y={20} delay={300} className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl text-gray-900 mb-4 tracking-[0.1em]">
                &ldquo;Actually Relaxed&rdquo;
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The maid of honor gets to actually enjoy the party instead of playing logistics coordinator all weekend.
              </p>
            </ScrollRevealCSS>
          </div>

          <div className="mt-16 bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center">
              <h3 className="font-heading text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                Real Review from Last Weekend
              </h3>
              <blockquote className="text-lg text-gray-700 italic mb-4 max-w-4xl mx-auto">
                &ldquo;OMG thank you!! We were staying at different Airbnbs and moving between Lake Travis and downtown, and you guys somehow had everything waiting for us at every stop. The bride had no idea we coordinated this and she cried happy tears when the champagne showed up at the boat dock. 10/10 would book again for my own bach!&rdquo;
              </blockquote>
              <cite className="text-brand-yellow font-medium">— Sarah M., Maid of Honor (Austin bach party, March 2024)</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks - 1-Click Bundles */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
            <h2 className="font-heading font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Top Picks for Bach Groups
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Skip the guesswork. These bundles are exactly what Austin bach groups order most—ready to add to cart in 30 seconds.
            </p>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topPicks.map((bundle, index) => (
              <ScrollRevealCSS
                key={bundle.name}
                duration={800}
                y={20}
                delay={index * 100}
                className={`bg-white rounded-lg shadow-lg p-6 relative ${
                  bundle.featured ? 'border-2 border-brand-yellow scale-105' : 'border border-gray-200'
                }`}
              >
                {bundle.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-yellow text-white px-4 py-2 rounded-full text-sm font-medium tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl text-gray-900 mb-1 tracking-[0.1em]">
                      {bundle.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {bundle.price}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                    {bundle.savings}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-6">
                  {bundle.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">What&apos;s included:</h4>
                  {bundle.items.map((item, i) => (
                    <div key={i} className="flex items-start text-sm text-gray-700">
                      <span className="text-brand-yellow mr-2 mt-1">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-3 px-4 rounded-lg font-medium text-sm tracking-wider transition-colors ${
                  bundle.featured
                    ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-500'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  {bundle.cta}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  48-hour delivery • Austin metro only
                </p>
              </ScrollRevealCSS>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="border-2 border-brand-yellow text-brand-yellow px-8 py-3 rounded-lg hover:bg-brand-yellow hover:text-white transition-colors tracking-[0.1em]">
              VIEW ALL PRODUCTS →
            </button>
          </div>
        </div>
      </section>

      {/* Popular Add-Ons */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
            <h2 className="font-heading font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Popular Last-Minute Adds
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              78% of bach groups add at least one of these. Order now or add during delivery.
            </p>
          </ScrollRevealCSS>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: "Ice + Cooler Delivery",
                price: "+$49",
                description: "20lbs ice + premium cooler delivered with your order",
                benefit: "No melted ice disasters",
                popular: true,
                cta: "ADD TO CART"
              },
              {
                title: "Emergency Backup Order",
                price: "+$99",
                description: "Extra bottles on standby for same-day delivery if needed",
                benefit: "Peace of mind if you run out",
                popular: true,
                cta: "ADD BACKUP"
              },
              {
                title: "Morning-After Recovery Pack",
                price: "+$79",
                description: "Electrolytes, coffee, bagels delivered 9 AM next day",
                benefit: "Everyone remembers you're the hero",
                popular: false,
                cta: "ADD RECOVERY"
              },
              {
                title: "Multi-Stop Coordination",
                price: "+$150",
                description: "We coordinate deliveries to 2-3 different locations",
                benefit: "Perfect for boat + hotel combos",
                popular: false,
                cta: "ADD COORDINATION"
              }
            ].map((addon, index) => (
              <ScrollRevealCSS
                key={addon.title}
                duration={800}
                y={20}
                delay={index * 100}
                className={`bg-white rounded-lg p-6 shadow-lg ${
                  addon.popular ? 'border-2 border-brand-yellow' : 'border border-gray-200'
                }`}
              >
                {addon.popular && (
                  <div className="mb-4">
                    <span className="bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-heading text-xl text-gray-900 tracking-[0.1em]">
                    {addon.title}
                  </h3>
                  <span className="text-2xl font-bold text-gray-900">
                    {addon.price}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {addon.description}
                </p>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-6">
                  <p className="text-green-800 text-sm font-medium">
                    Why bach groups love this: {addon.benefit}
                  </p>
                </div>
                
                <button className={`w-full py-3 px-4 rounded-lg font-medium text-sm tracking-wider transition-colors ${
                  addon.popular
                    ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-500'
                    : 'border border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-white'
                }`}>
                  {addon.cta}
                </button>
              </ScrollRevealCSS>
            ))}
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h3 className="font-heading text-xl text-gray-900 mb-4 tracking-[0.1em]">
              Can&apos;t Decide? Get Them All
            </h3>
            <p className="text-gray-600 mb-6">
              Bundle all 4 add-ons and save $50. Most bach groups say &ldquo;I wish we had ordered everything.&rdquo;
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-center">
                <span className="text-sm text-gray-500 line-through">$377 individual</span>
                <span className="block text-2xl font-bold text-gray-900">$327 bundled</span>
              </div>
              <button className="bg-brand-yellow text-white px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors tracking-[0.1em]">
                ADD COMPLETE BUNDLE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={20} className="text-center">
            <p className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
              &ldquo;PartyOn made my bachelorette weekend absolutely perfect! They coordinated 
              deliveries to three different venues, created custom cocktails for our group, 
              and the service was flawless. Highly recommend for any Austin celebration!&rdquo;
            </p>
            <p className="text-gray-900 font-light tracking-[0.1em]">
              Jessica Martinez
            </p>
            <p className="text-brand-yellow text-sm tracking-[0.1em]">
              Bachelorette Weekend, September 2023
            </p>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Bach Party FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
            <h2 className="font-heading font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Bach Party Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to the top 5 things every bach group asks us.
            </p>
          </ScrollRevealCSS>

          <div className="space-y-6">
            {[
              {
                question: "Can you deliver to our Airbnb AND the party bus?",
                answer: "Yes! We coordinate multi-location deliveries all the time. Add our Multi-Stop Coordination service (+$150) and we'll handle timing between locations."
              },
              {
                question: "What if we run out of alcohol during the party?",
                answer: "Book our Emergency Backup Order (+$99) and we'll have extra bottles on standby for same-day delivery. Most bach groups add this for peace of mind."
              },
              {
                question: "How cold will the drinks be when delivered?",
                answer: "Ice cold. We use insulated coolers and deliver within 30 minutes of leaving our facility. Add Ice + Cooler service (+$49) to keep everything cold all night."
              },
              {
                question: "Can we split payment among the group?",
                answer: "One person books and pays, then you sort out splitting costs yourselves. This actually reduces group drama according to our customers."
              },
              {
                question: "What if weather ruins our Lake Travis plans?",
                answer: "We'll coordinate with you to redirect delivery to your backup location at no extra charge. Just give us 4+ hours notice for location changes."
              }
            ].map((faq, index) => (
              <ScrollRevealCSS
                key={index}
                duration={800}
                y={20}
                delay={index * 100}
                className="bg-white rounded-lg p-6 shadow-lg"
              >
                <h3 className="font-heading text-lg text-gray-900 mb-3 tracking-[0.1em]">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </ScrollRevealCSS>
            ))}
          </div>

          <div className="mt-12 text-center bg-white rounded-lg p-8 shadow-lg">
            <h3 className="font-heading text-xl text-gray-900 mb-4 tracking-[0.1em]">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our bach party coordinators have planned 500+ Austin celebrations. 
              Get answers to your specific situation.
            </p>
            <button className="bg-brand-yellow text-white px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors tracking-[0.1em]">
              TEXT US: (737) 371-9700
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <ScrollRevealCSS duration={800} y={20}>
            <h2 className="font-heading font-light text-4xl md:text-5xl text-white mb-6 tracking-[0.1em]">
              Make It Legendary
            </h2>
            <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
              Start planning your unforgettable celebration today
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/book-now">
                <button className="px-10 py-4 bg-brand-yellow text-gray-900 hover:bg-yellow-600 transition-colors tracking-[0.08em] text-sm">
                  PLAN YOUR PARTY
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-4 border-2 border-brand-yellow text-gray-900 hover:bg-brand-yellow hover:text-white transition-all duration-300 tracking-[0.08em] text-sm">
                  CUSTOM PACKAGE
                </button>
              </Link>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/images/pod-logo-2025.svg" 
                alt="Party On Delivery"
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier celebration service since 2020.
              </p>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">SERVICES</h4>
              <ul className="space-y-2">
                <li><Link href="/weddings" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">Weddings</Link></li>
                <li><Link href="/boat-parties" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">Boat Parties</Link></li>
                <li><Link href="/bach-parties" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">Celebrations</Link></li>
                <li><Link href="/corporate" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">Corporate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">PARTY ZONES</h4>
              <ul className="space-y-2">
                <li><Link href="/delivery-areas#downtown" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">Downtown</Link></li>
                <li><Link href="/delivery-areas#east" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">East Austin</Link></li>
                <li><Link href="/delivery-areas#domain" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">The Domain</Link></li>
                <li><Link href="/delivery-areas#lake" className="text-gray-600 hover:text-brand-yellow text-sm transition-colors">Lake Travis</Link></li>
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
              <Link href="/terms" className="text-gray-500 hover:text-brand-yellow text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-brand-yellow text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}