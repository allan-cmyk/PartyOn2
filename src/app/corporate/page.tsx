'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';

export default function CorporateEventsPage() {

  const services = [
    {
      title: "Executive Meetings",
      description: "Professional bar service for board meetings, executive gatherings, and high-stakes negotiations",
      features: [
        "Premium spirits selection",
        "Discreet, professional bartenders",
        "Custom cocktail menus",
        "Executive lounge setup"
      ]
    },
    {
      title: "Client Entertainment",
      description: "Impress clients with sophisticated beverage service for dinners, receptions, and networking events",
      features: [
        "Curated wine pairings",
        "Signature cocktails",
        "Champagne service",
        "Premium glassware"
      ]
    },
    {
      title: "Company Celebrations",
      description: "Mark milestones and achievements with elevated bar service for your team",
      features: [
        "Full bar packages",
        "Craft cocktail stations",
        "Non-alcoholic options",
        "Professional presentation"
      ]
    },
    {
      title: "Conference & Trade Shows",
      description: "Stand out at industry events with premium beverage service at your booth or hospitality suite",
      features: [
        "Portable bar setups",
        "Brand-themed cocktails",
        "Licensed service staff",
        "Flexible scheduling"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "PartyOn Delivery elevated our client dinner to an unforgettable experience. The attention to detail was impeccable.",
      author: "Sarah Mitchell",
      title: "CEO, Austin Tech Ventures"
    },
    {
      quote: "Their professional service and premium selection helped us close our biggest deal of the year.",
      author: "Robert Chen",
      title: "Managing Partner, Hill Country Capital"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center">
        <Image
          src="/images/hero/austin-skyline-golden-hour.webp"
          alt="Austin skyline at golden hour"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto px-8 text-white"
        >
          <p className="text-gold-400 tracking-[0.2em] mb-4">PROFESSIONAL BAR SERVICE</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 tracking-[0.1em]">
            Corporate Events
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed mb-8">
            Elevate your business gatherings with Austin&apos;s premier corporate beverage service
          </p>
          <Link href="/order">
            <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em]">
              REQUEST PROPOSAL
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl text-gray-900 mb-6 tracking-[0.1em]">
              Where Business Meets Sophistication
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              In the competitive Austin business landscape, every detail matters. Our premium bar service transforms 
              ordinary corporate gatherings into memorable experiences that strengthen relationships and close deals.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {[
              { number: "500+", label: "Corporate Events" },
              { number: "98%", label: "Client Retention" },
              { number: "24/7", label: "Event Support" },
              { number: "5★", label: "Average Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="font-serif text-4xl text-gold-600 mb-2">{stat.number}</p>
                <p className="text-sm text-gray-600 tracking-[0.1em]">{stat.label.toUpperCase()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-serif text-4xl text-center text-gray-900 mb-16 tracking-[0.1em]"
          >
            Tailored Corporate Solutions
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 border border-gray-200 hover:border-gold-600 transition-colors"
              >
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-serif text-4xl text-center text-gray-900 mb-16 tracking-[0.1em]"
          >
            The Corporate Advantage
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Licensed & Insured",
                description: "Full liability coverage and all required permits for corporate events"
              },
              {
                icon: (
                  <svg className="w-12 h-12 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Flexible Billing",
                description: "Corporate accounts, purchase orders, and NET payment terms available"
              },
              {
                icon: (
                  <svg className="w-12 h-12 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: "Venue Partnerships",
                description: "Preferred vendor at Austin&apos;s top corporate venues and hotels"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                {feature.icon}
                <h3 className="font-serif text-2xl text-gray-900 mt-6 mb-4 tracking-[0.1em]">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-serif text-4xl text-center text-gray-900 mb-16 tracking-[0.1em]"
          >
            Client Success Stories
          </motion.h2>

          <div className="space-y-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="font-serif text-2xl text-gray-700 mb-6 italic leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gold-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-4xl mb-6 tracking-[0.1em]">
            Ready to Elevate Your Next Corporate Event?
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            Let&apos;s discuss how our premium bar service can enhance your business gatherings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <button className="px-8 py-4 bg-white text-gold-600 hover:bg-gray-100 transition-colors tracking-[0.15em]">
                REQUEST PROPOSAL
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gold-600 transition-colors tracking-[0.15em]">
                SCHEDULE CONSULTATION
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.15em]">PARTYON</h3>
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
                <li><Link href="/products?filter=spirits" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Spirits</Link></li>
                <li><Link href="/products?filter=wine" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Wine</Link></li>
                <li><Link href="/products?filter=packages" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Packages</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: hello@partyondelivery.com</li>
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