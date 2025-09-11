'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import LuxuryCard from '@/components/LuxuryCard';

export default function WeddingsPage() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
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
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
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
        
        {/* Hero Dots Navigation */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
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
            WEDDING
            <span className="block text-gold-400 mt-2">EXCELLENCE</span>
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] text-gray-200">
            Elevating Austin&apos;s Most Beautiful Celebrations
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
              Your Special Day Deserves Excellence
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              From intimate Hill Country ceremonies to grand Lake Travis receptions, 
              we bring sophistication and impeccable service to your wedding celebration. 
              Our professional bartenders ensure every toast is perfect and every guest 
              is served with distinction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              The PartyOn Difference
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Premium Spirits Selection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Curated collection of top-shelf spirits, fine wines, and craft cocktails. 
                  Every selection chosen to complement your celebration perfectly.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Professional Service Team
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  TABC-certified bartenders with years of experience in luxury events. 
                  Dressed in formal attire to match your wedding&apos;s elegance.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Seamless Coordination
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We work directly with your venue and wedding planner to ensure 
                  flawless execution. Setup and breakdown handled with precision.
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
                src="/images/services/weddings/signature-cocktails-closeup.webp"
                alt="Signature Wedding Cocktails"
                fill
                className="object-cover rounded-lg"
              />
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
              Wedding Packages
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
                  <Link href={`/weddings/packages/${pkg.name.toLowerCase().replace(/ /g, '-')}`}>
                    <button className={`w-full py-3 tracking-[0.15em] text-sm transition-all duration-300 ${
                      pkg.featured 
                        ? 'bg-gold-600 text-white hover:bg-gold-700' 
                        : 'border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white'
                    }`}>
                      CUSTOMIZE PACKAGE
                    </button>
                  </Link>
                </div>
              </LuxuryCard>
            ))}
          </div>
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

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-white mb-6 tracking-[0.1em]">
              Begin Planning Your Perfect Day
            </h2>
            <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
              Let&apos;s discuss how we can make your wedding celebration extraordinary
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/book-now">
                <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                  BOOK CONSULTATION
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-4 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  VIEW AVAILABILITY
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
                <li>Email: weddings@partyondelivery.com</li>
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