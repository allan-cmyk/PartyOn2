'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navigation from "@/components/Navigation";
import { useCustomProducts } from '@/lib/cart/hooks/useCustomProducts';
import MobileProductCard from '@/components/mobile/MobileProductCard';
import CompactProductCard from '@/components/shopify/CompactProductCard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getProductCategory } from '@/lib/products/categories';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

export default function LynnsLodgingPartnerPage() {
  const { products, loading } = useCustomProducts(50, false);
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState('all');
  
  // Curated product selection for vacation rentals
  const curatedProducts = products.filter(product => {
    const category = getProductCategory(product);
    const title = product.title.toLowerCase();
    
    // Filter for party-friendly products
    if (filter === 'welcome') {
      return category === 'seltzersChamps' || 
             title.includes('champagne') || 
             title.includes('prosecco') ||
             title.includes('welcome');
    }
    if (filter === 'bach') {
      return category === 'cocktails' || 
             category === 'seltzersChamps' ||
             title.includes('party') ||
             title.includes('celebration');
    }
    if (filter === 'group') {
      return title.includes('pack') || 
             title.includes('case') ||
             parseFloat(product.priceRange.minVariantPrice.amount) > 100;
    }
    if (filter === 'local') {
      return product.vendor?.toLowerCase().includes('austin') ||
             product.vendor?.toLowerCase().includes('texas') ||
             title.includes('local');
    }
    
    return filter === 'all';
  }).slice(0, 24);

  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      {/* Hero Section with Lynn's Lodging Branding */}
      <section className="relative h-[60vh] mt-24 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b4235] via-[#2a5444] to-[#1b4235]" />
        
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,248,237,0.1) 35px, rgba(255,248,237,0.1) 70px)`,
          }} />
        </div>
        
        <div className="hero-fade-in relative text-center z-10 max-w-5xl mx-auto px-8">

          {/* Partner Badge */}
          <div className="hero-fade-in inline-flex items-center gap-2 bg-[#fff8ed] px-4 py-2 rounded-full mb-6" style={{ animationDelay: '0.3s' }}>
            <svg className="w-4 h-4 text-[#1b4235]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#1b4235] tracking-wider">EXCLUSIVE PARTNER</span>
          </div>

          <h1 className="mb-6">
            <span className="block font-heading text-[#fff8ed] text-2xl mb-3 tracking-[0.08em] font-light">
              LYNN&apos;S LODGING
            </span>
            <span className="block text-[#fff8ed] text-5xl md:text-7xl tracking-[0.08em]" style={{ fontFamily: 'Georgia Pro Condensed, Georgia, serif' }}>
              Premium Spirits
            </span>
            <span className="block text-[#fff8ed] text-3xl md:text-5xl mt-2 tracking-[0.1em] font-light">
              for Your Austin Escape
            </span>
          </h1>
          
          <div className="w-32 h-px bg-[#fff8ed] mx-auto mb-6" />
          
          <p className="text-lg text-[#fff8ed]/90 max-w-2xl mx-auto leading-relaxed tracking-wide">
            Elevate your stay with curated alcohol delivery. From welcome champagne to bachelor party packages, 
            we bring the celebration to your vacation rental.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#packages"
              className="px-8 py-3 bg-[#fff8ed] text-[#1b4235] font-semibold tracking-wider hover:bg-white hover:scale-105 transition-all"
            >
              VIEW PACKAGES
            </a>
            <a
              href="https://lynnslodging.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-[#fff8ed] text-[#fff8ed] font-semibold tracking-wider hover:bg-[#fff8ed] hover:text-[#1b4235] hover:scale-105 transition-all"
            >
              BOOK YOUR STAY
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-[#fff8ed] py-6">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-[#1b4235]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="text-sm font-medium tracking-wider">LOCALS&apos; CHOICE</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium tracking-wider">VERIFIED PARTNER</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="text-sm font-medium tracking-wider">CONCIERGE SERVICE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Special Packages */}
      <section id="packages" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <ScrollRevealCSS duration={800} delay={0} y={30}>
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl text-[#1b4235] mb-4 tracking-[0.1em]">
                Curated Packages for Every Stay
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pre-arrival delivery ensures your vacation starts the moment you walk through the door
              </p>
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Welcome Package */}
            <ScrollRevealCSS duration={800} delay={0} y={30}>
              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-[#fff8ed] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#1b4235]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading text-[#1b4235] mb-3">Welcome Arrival</h3>
              <p className="text-gray-600 mb-4">
                Start your Austin adventure right with champagne, local craft beers, and artisan snacks waiting in your rental.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Premium champagne</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Local beer selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Mixers & garnishes</span>
                </li>
              </ul>
              <p className="text-2xl font-bold text-[#1b4235]">From $150</p>
              </div>
            </ScrollRevealCSS>

            {/* Bachelor/Bachelorette Package */}
            <ScrollRevealCSS duration={800} delay={100} y={30}>
              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow relative">

              <div className="absolute -top-3 -right-3 bg-brand-yellow text-gray-900 px-4 py-1 text-xs tracking-wider">
                MOST POPULAR
              </div>
              <div className="w-16 h-16 bg-[#fff8ed] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#1b4235]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V5h18v10.546zM15 7h2m-2 4h2m-6-4h2m-2 4h2m-6-4h2m-2 4h2" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading text-[#1b4235] mb-3">Bach Party Package</h3>
              <p className="text-gray-600 mb-4">
                Everything you need for an unforgettable celebration. Customizable for your group size and preferences.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Group-sized quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Cocktail essentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Party supplies included</span>
                </li>
              </ul>
              <p className="text-2xl font-bold text-[#1b4235]">From $350</p>
              </div>
            </ScrollRevealCSS>

            {/* Weekend Getaway */}
            <ScrollRevealCSS duration={800} delay={200} y={30}>
              <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">

              <div className="w-16 h-16 bg-[#fff8ed] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#1b4235]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading text-[#1b4235] mb-3">Weekend Retreat</h3>
              <p className="text-gray-600 mb-4">
                Stock your rental for the perfect Austin weekend. Local favorites and premium spirits for your group.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Wine selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Craft cocktails</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#1b4235] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Brunch essentials</span>
                </li>
              </ul>
              <p className="text-2xl font-bold text-[#1b4235]">From $250</p>
              </div>
            </ScrollRevealCSS>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-8 border-b border-gray-200 sticky top-24 bg-white z-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { value: 'all', label: 'All Products' },
              { value: 'welcome', label: 'Welcome Drinks' },
              { value: 'bach', label: 'Party Packages' },
              { value: 'group', label: 'Group Orders' },
              { value: 'local', label: 'Austin Favorites' }
            ].map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-6 py-2.5 text-sm tracking-wider transition-all ${
                  filter === cat.value 
                    ? 'bg-[#1b4235] text-[#fff8ed]' 
                    : 'border border-[#1b4235] text-[#1b4235] hover:bg-[#fff8ed]'
                }`}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl text-[#1b4235] mb-4">
              Delivered to Your Lynn&apos;s Lodging Rental
            </h2>
            <p className="text-gray-600">
              Order now for delivery before your arrival. 72-hour advance notice required.
            </p>
          </div>

          {loading && products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b4235]"></div>
            </div>
          ) : (
            <div className={
              isMobile 
                ? "grid grid-cols-2 gap-3 px-4" 
                : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            }>
              {curatedProducts.map((product, index) => 
                isMobile 
                  ? <MobileProductCard key={product.id} product={product} index={index} />
                  : <CompactProductCard key={product.id} product={product} index={index} />
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#fff8ed]">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="font-heading text-3xl text-[#1b4235] text-center mb-12">
            Seamless Delivery to Your Vacation Rental
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Book Your Stay',
                desc: 'Reserve your Lynn&apos;s Lodging property',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                )
              },
              {
                step: '2',
                title: 'Select Your Package',
                desc: 'Choose from curated selections or build custom',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                )
              },
              {
                step: '3',
                title: 'Schedule Delivery',
                desc: 'Coordinate with your check-in time',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
              },
              {
                step: '4',
                title: 'Arrive & Enjoy',
                desc: 'Everything waiting at your rental',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                )
              }
            ].map((item, idx) => (
              <ScrollRevealCSS key={idx} duration={800} delay={idx * 100} y={30}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-[#1b4235]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-[#1b4235] mb-2">{item.step}</div>
                  <h3 className="font-semibold text-[#1b4235] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#1b4235]/80">{item.desc}</p>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1b4235] to-[#2a5444]">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-heading text-4xl text-[#fff8ed] mb-6">
            Ready to Elevate Your Austin Stay?
          </h2>
          <p className="text-xl text-[#fff8ed]/90 mb-8">
            Exclusive rates for Lynn&apos;s Lodging guests. Mention your property when ordering.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/order">
              <button className="px-8 py-4 bg-[#fff8ed] text-[#1b4235] font-semibold tracking-wider hover:bg-white hover:scale-105 transition-all">

                ORDER NOW
              </button>
            </Link>
            <a href="tel:737-371-9700">
              <button className="px-8 py-4 border-2 border-[#fff8ed] text-[#fff8ed] font-semibold tracking-wider hover:bg-[#fff8ed] hover:text-[#1b4235] hover:scale-105 transition-all">

                CALL CONCIERGE
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}