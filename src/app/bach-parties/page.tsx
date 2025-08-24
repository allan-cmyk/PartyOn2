'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';

export default function BachPartiesPage() {
  const packages = [
    {
      name: "Essential Celebration",
      price: "From $599",
      description: "Perfect start to your celebration weekend",
      features: [
        "Premium spirit selection",
        "Champagne toast included",
        "Mixers & garnishes",
        "Delivery to any Austin venue",
        "Up to 15 guests",
        "4-hour service window"
      ],
      featured: false
    },
    {
      name: "VIP Experience",
      price: "From $1,299",
      description: "Elevate your celebration with luxury service",
      features: [
        "Ultra-premium spirits",
        "Dedicated party concierge",
        "Custom cocktail creation",
        "Multiple venue delivery",
        "Up to 30 guests",
        "8-hour service window",
        "Signature party favors",
        "Professional bartender"
      ],
      featured: true
    },
    {
      name: "Ultimate Weekend",
      price: "From $2,499",
      description: "Complete weekend party experience",
      features: [
        "Full weekend coverage",
        "Multiple event locations",
        "Team of bartenders",
        "Unlimited premium spirits",
        "Up to 50 guests",
        "48-hour service window",
        "Luxury transportation bar",
        "Exclusive VIP treatment"
      ],
      featured: false
    }
  ];

  return (
    <div className="bg-white">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/services/bach-parties/bachelor-party-epic.webp"
          alt="Celebration Setup"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900/50" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
        >
          <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
            UNFORGETTABLE
            <span className="block text-gold-400 mt-2">CELEBRATIONS</span>
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] text-gray-200">
            Bachelor & Bachelorette Parties Elevated
          </p>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Celebrate in Distinguished Style
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your last celebration before the big day deserves exceptional service. 
              From Rainey Street revelry to Hill Country hideaways, we ensure your 
              party flows seamlessly with premium spirits and professional attention 
              to every detail.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Austin Destinations */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Austin&apos;s Premier Party Destinations
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                area: "Rainey Street",
                description: "Historic bungalows turned trendy bars, perfect for bar hopping celebrations"
              },
              {
                area: "6th Street",
                description: "Austin's entertainment district with endless nightlife options"
              },
              {
                area: "The Domain",
                description: "Upscale shopping and dining for sophisticated celebrations"
              },
              {
                area: "East Austin",
                description: "Hip breweries and unique venues for memorable experiences"
              },
              {
                area: "Lake Travis",
                description: "Waterfront venues and boat parties for sun-soaked celebrations"
              },
              {
                area: "Hill Country",
                description: "Wineries and ranches for exclusive private events"
              }
            ].map((destination, index) => (
              <motion.div
                key={destination.area}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-50 p-6 text-center"
              >
                <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.1em]">
                  {destination.area}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {destination.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Multi-Venue Coordination
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Seamless service across multiple locations. From hotel suites to party 
                  buses, restaurants to private venues, we ensure premium spirits follow 
                  your celebration wherever it leads.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Customized Experiences
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every celebration is unique. We craft personalized drink menus, coordinate 
                  with your itinerary, and ensure every toast is memorable with selections 
                  tailored to your group&apos;s preferences.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Professional Discretion
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Celebrate with confidence. Our professional team provides impeccable service 
                  while maintaining the perfect balance of attentiveness and discretion for 
                  your special occasion.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px]"
            >
              <Image
                src="/images/services/bach-parties/bachelorette-champagne-tower.webp"
                alt="Celebration Service"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Celebration Packages
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tailored experiences for bachelor and bachelorette parties
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`bg-white p-8 ${
                  pkg.featured ? 'ring-2 ring-gold-600 shadow-lg' : 'border border-gray-200'
                }`}
              >
                {pkg.featured && (
                  <div className="text-center mb-4">
                    <span className="text-gold-600 text-sm tracking-[0.15em]">MOST POPULAR</span>
                  </div>
                )}
                <h3 className="font-serif text-2xl text-gray-900 mb-2 tracking-[0.1em] text-center">
                  {pkg.name}
                </h3>
                <p className="text-3xl text-gold-600 font-light text-center mb-4">
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
                <Link href={`/bach-parties/packages/${pkg.name.toLowerCase().replace(/ /g, '-')}`}>
                  <button className={`w-full py-3 tracking-[0.15em] text-sm transition-all duration-300 ${
                    pkg.featured 
                      ? 'bg-gold-600 text-white hover:bg-gold-700' 
                      : 'border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white'
                  }`}>
                    CUSTOMIZE PACKAGE
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-On Services */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-3xl text-gray-900 mb-4 tracking-[0.1em]">
              Enhance Your Celebration
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { service: "Party Bus Bar", price: "+$299" },
              { service: "Private Mixologist", price: "+$399" },
              { service: "Champagne Tower", price: "+$199" },
              { service: "Recovery Brunch", price: "+$249" }
            ].map((addon, index) => (
              <motion.div
                key={addon.service}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 text-center border border-gray-200 hover:border-gold-600 transition-colors"
              >
                <h4 className="font-light text-gray-900 mb-2 tracking-[0.1em]">
                  {addon.service}
                </h4>
                <p className="text-gold-600 text-lg">
                  {addon.price}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
              &ldquo;PartyOn made my bachelorette weekend absolutely perfect! They coordinated 
              deliveries to three different venues, created custom cocktails for our group, 
              and the service was flawless. Highly recommend for any Austin celebration!&rdquo;
            </p>
            <p className="text-gray-900 font-light tracking-[0.1em]">
              Jessica Martinez
            </p>
            <p className="text-gold-600 text-sm tracking-[0.1em]">
              Bachelorette Weekend, September 2023
            </p>
          </motion.div>
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
              Make It Legendary
            </h2>
            <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
              Start planning your unforgettable celebration today
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/book-now">
                <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                  PLAN YOUR PARTY
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-4 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  CUSTOM PACKAGE
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
              <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.15em]">PARTYON</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier celebration service since 2020.
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
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">PARTY ZONES</h4>
              <ul className="space-y-2">
                <li><Link href="/delivery-areas#downtown" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Downtown</Link></li>
                <li><Link href="/delivery-areas#east" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">East Austin</Link></li>
                <li><Link href="/delivery-areas#domain" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">The Domain</Link></li>
                <li><Link href="/delivery-areas#lake" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Lake Travis</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: party@partyondelivery.com</li>
                <li>Hours: 10am - 11pm Daily</li>
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
    </div>
  );
}