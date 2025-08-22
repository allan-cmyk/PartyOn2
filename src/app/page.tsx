'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';

export default function HomePage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/austin-skyline-hero.webp"
          alt="Austin Skyline"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
        >
          <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
            DISTINGUISHED
            <span className="block text-gold-400 mt-2">ALCOHOL DELIVERY</span>
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] mb-12 text-gray-200">
            Austin&apos;s Premier Spirits & Event Service
          </p>
          <Link href="/order">
            <button className="px-10 py-4 border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm">
              BEGIN YOUR EXPERIENCE
            </button>
          </Link>
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

      {/* The PartyOn Experience */}
      <section id="experience" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              The PartyOn Experience
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Curated Selection",
                description: "Premium spirits and wines selected by our sommeliers for the most discerning palates",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )
              },
              {
                title: "Swift Delivery",
                description: "Professional service within 72 hours, ensuring your event proceeds flawlessly",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Trusted Excellence",
                description: "Licensed, insured, and TABC certified with over 500 five-star reviews",
                icon: (
                  <svg className="w-14 h-14 mx-auto text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
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
              Signature Services
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Elevating Austin&apos;s most memorable moments with unparalleled service and sophistication
            </p>
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
                Wedding Excellence
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Transform your special day into an unforgettable celebration. Our licensed bartenders 
                and premium spirits selection ensure every toast is perfect.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Professional bartenders & servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Custom cocktail menu design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Complete setup & breakdown</span>
                </li>
              </ul>
              <Link href="/weddings">
                <button className="text-gold-600 hover:text-gold-700 tracking-[0.1em] text-sm transition-colors">
                  EXPLORE PACKAGES →
                </button>
              </Link>
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
                Lake Travis Luxury
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Elevate your Lake Travis experience with our exclusive boat party packages. 
                Premium spirits delivered directly to your vessel.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Dock or water delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Coolers & ice included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Safety-focused service</span>
                </li>
              </ul>
              <Link href="/boat-parties">
                <button className="text-gold-600 hover:text-gold-700 tracking-[0.1em] text-sm transition-colors">
                  EXPLORE PACKAGES →
                </button>
              </Link>
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
                Corporate Distinction
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Impress clients and celebrate success with our executive bar service. 
                Professional presentation for Austin&apos;s business elite.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Executive bar service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Brand customization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold-600 mr-3">•</span>
                  <span className="text-gray-700">Invoice billing available</span>
                </li>
              </ul>
              <Link href="/corporate">
                <button className="text-gold-600 hover:text-gold-700 tracking-[0.1em] text-sm transition-colors">
                  EXPLORE PACKAGES →
                </button>
              </Link>
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
                text: "PartyOn transformed our corporate retreat into an unforgettable experience. Their attention to detail and professional service exceeded all expectations.",
                author: "Sarah Mitchell",
                role: "CEO, TechStartup Austin"
              },
              {
                text: "Our Lake Travis wedding was perfect thanks to PartyOn. The bartenders were professional, the drinks were exceptional, and the service was flawless.",
                author: "Michael & Emma Chen",
                role: "Westlake Hills Wedding"
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
              Begin Your Experience
            </h2>
            <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
              Order 72 hours in advance for guaranteed availability
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/order">
                <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                  ORDER NOW
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-4 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  GET IN TOUCH
                </button>
              </Link>
              <a href="tel:7373719700">
                <button className="px-10 py-4 border-2 border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  (737) 371-9700
                </button>
              </a>
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