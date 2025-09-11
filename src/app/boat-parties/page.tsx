'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import LuxuryCard from '@/components/LuxuryCard';

export default function BoatPartiesPage() {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  
  const heroImages = [
    {
      src: '/images/boat-heroes/boat-party-epic-sunset.webp',
      alt: 'Epic Lake Travis sunset party',
      fallback: '/images/services/boat-parties/luxury-yacht-deck.webp'
    },
    {
      src: '/images/boat-heroes/boat-party-epic-cove.webp',
      alt: 'Devils Cove party scene',
      fallback: '/images/services/boat-parties/multiple-yachts-party.webp'
    },
    {
      src: '/images/boat-heroes/boat-party-epic-night.webp',
      alt: 'Night yacht party on Lake Travis',
      fallback: '/images/gallery/sunset-champagne-pontoon.webp'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const packages = [
    {
      name: "Sunset Cruise",
      price: "From $399",
      description: "Intimate sunset experience on Lake Travis",
      features: [
        "Premium cooler selection",
        "Ice & mixers included",
        "Dock delivery service",
        "Up to 12 guests",
        "Perfect for small vessels",
        "Curated wine & beer selection"
      ],
      featured: false
    },
    {
      name: "Lake Life Luxury",
      price: "From $899",
      description: "Our signature package for unforgettable lake days",
      features: [
        "Multiple premium coolers",
        "Full bar setup on deck",
        "Water or dock delivery",
        "Up to 25 guests",
        "Professional setup crew",
        "Premium spirits & champagne",
        "Floating bar accessories"
      ],
      featured: true
    },
    {
      name: "Regatta Ready",
      price: "From $1,599",
      description: "Ultimate luxury for yacht parties and regattas",
      features: [
        "Complete yacht bar service",
        "Professional bartender",
        "Ultra-premium selections",
        "Up to 50 guests",
        "Custom cocktail menu",
        "Gold-standard service",
        "Captain coordination",
        "All-day provisions"
      ],
      featured: false
    }
  ];

  return (
    <div className="bg-white">
      <OldFashionedNavigation />
      
      {/* Hero Section with Image Slider */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentHeroImage].src}
              alt={heroImages[currentHeroImage].alt}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.src = heroImages[currentHeroImage].fallback;
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900/50" />
        
        {/* Slider Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentHeroImage 
                  ? 'bg-gold-400 w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
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
            LAKE TRAVIS
            <span className="block text-gold-400 mt-2">LUXURY</span>
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] text-gray-200">
            Premium Spirits Delivered to Your Vessel
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
              Elevate Your Lake Experience
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              From sunrise cruises to sunset celebrations, we deliver premium spirits 
              and exceptional service directly to your vessel. Our Lake Travis specialists 
              understand the unique needs of waterfront entertaining, ensuring your day 
              on the water is nothing short of extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px]"
            >
              <Image
                src="/images/services/boat-parties/sunset-champagne-pontoon.webp"
                alt="Premium Lake Service"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Dock & Water Delivery
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Whether you&apos;re docked at the marina or anchored in a cove, 
                  our specialized delivery team brings your premium selections directly 
                  to you. Safety and convenience are our priorities.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Marine-Grade Equipment
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All coolers, ice provisions, and bar accessories are selected specifically 
                  for marine environments. Your beverages stay perfectly chilled from 
                  departure to sunset.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em]">
                  Lake Travis Expertise
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our team knows every marina, cove, and hotspot on Lake Travis. 
                  We coordinate with captains and crews to ensure seamless service 
                  that enhances your lake day experience.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              Serving Lake Travis&apos;s Finest
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "The Oasis",
                description: "Sunset views & premium service at Austin's iconic lakeside destination",
                image: "/images/lake-travis/the-oasis-sunset.webp"
              },
              {
                name: "Devil's Cove",
                description: "Party cove deliveries with safety-first approach and cold refreshments",
                image: "/images/lake-travis/devils-cove-party.webp"
              },
              {
                name: "Volente Beach",
                description: "Water park adjacent deliveries for family-friendly lake adventures",
                image: "/images/lake-travis/volente-beach.webp"
              },
              {
                name: "Hudson Bend",
                description: "Quiet cove service for those seeking tranquil lake experiences",
                image: "/images/lake-travis/hudson-bend-quiet.webp"
              },
              {
                name: "Lakeway Marina",
                description: "Full-service dock deliveries with professional setup assistance",
                image: "/images/lake-travis/lakeway-marina.webp"
              },
              {
                name: "Point Venture",
                description: "Exclusive community access with discreet, luxury service",
                image: "/images/lake-travis/point-venture.webp"
              }
            ].map((location, index) => (
              <LuxuryCard
                key={location.name}
                backgroundImage={location.image}
                index={index}
                className="rounded-lg"
              >
                <div className="p-6 text-center">
                  <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">
                    {location.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {location.description}
                  </p>
                </div>
              </LuxuryCard>
            ))}
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
              Lake Packages
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Curated selections for every type of lake adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <LuxuryCard
                key={pkg.name}
                featured={pkg.featured}
                backgroundImage={
                  index === 0 ? '/images/gallery/sunset-champagne-pontoon.webp' :
                  index === 1 ? '/images/services/boat-parties/luxury-yacht-deck.webp' :
                  '/images/services/boat-parties/multiple-yachts-party.webp'
                }
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
                  <Link href={`/boat-parties/packages/${pkg.name.toLowerCase().replace(/ /g, '-')}`}>
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

      {/* Safety Notice */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-serif font-light text-3xl text-gray-900 mb-6 tracking-[0.1em]">
              Safety First on the Water
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We promote responsible enjoyment on Lake Travis. All deliveries include 
              complimentary water bottles and our team is trained in marine safety protocols. 
              We work with certified captains and encourage designated drivers for all vessels.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-700">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gold-600 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                TABC Certified
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gold-600 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Marine Safety Trained
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gold-600 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Insured & Licensed
              </div>
            </div>
          </motion.div>
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
              &ldquo;PartyOn transformed our corporate yacht party into an incredible experience. 
              The dock delivery was seamless, the bar setup was stunning, and our clients 
              were thoroughly impressed. Lake Travis has never been better!&rdquo;
            </p>
            <p className="text-gray-900 font-light tracking-[0.1em]">
              James Richardson
            </p>
            <p className="text-gold-600 text-sm tracking-[0.1em]">
              CEO, Austin Tech Ventures
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
              Set Sail in Style
            </h2>
            <p className="text-gray-300 text-lg mb-12 tracking-[0.05em]">
              Book your Lake Travis delivery 72 hours in advance
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/book-now">
                <button className="px-10 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm">
                  BOOK LAKE DELIVERY
                </button>
              </Link>
              <a href="tel:7373719700">
                <button className="px-10 py-4 border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm">
                  CALL CAPTAIN&apos;S LINE
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
                Lake Travis&apos;s premier boat party service since 2020.
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
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">LAKE TRAVIS</h4>
              <ul className="space-y-2">
                <li><Link href="/delivery-areas#lake-travis" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Marinas</Link></li>
                <li><Link href="/safety" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Safety Info</Link></li>
                <li><Link href="/captains" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Captain Partners</Link></li>
                <li><Link href="/weather" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Lake Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: lake@partyondelivery.com</li>
                <li>Marina Hours: 8am - 8pm</li>
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