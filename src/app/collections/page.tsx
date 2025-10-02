'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';

const COLLECTIONS = [
  {
    handle: 'wedding-packages',
    title: 'Wedding Packages',
    description: 'Complete bar service solutions for your special day',
    image: '/images/weddings/wedding-bar-setup-golden.webp',
    featured: true
  },
  {
    handle: 'premium-spirits',
    title: 'Premium Spirits',
    description: 'Top-shelf whiskeys, vodkas, gins, and more',
    image: '/images/products/premium-spirits-wall.webp',
    featured: true
  },
  {
    handle: 'wine-collection',
    title: 'Fine Wine Collection',
    description: 'Curated selection of reds, whites, and champagnes',
    image: '/images/hero/wine-glasses.webp',
    featured: true
  },
  {
    handle: 'craft-beer',
    title: 'Craft Beer Selection',
    description: 'Local Austin breweries and imported favorites',
    image: '/images/hero/lake-travis-sunset.webp',
    featured: false
  },
  {
    handle: 'party-packages',
    title: 'Party Packages',
    description: 'Pre-selected bundles for every celebration',
    image: '/images/boat-parties/boat-party-bar-setup.webp',
    featured: true
  },
  {
    handle: 'mixers-garnishes',
    title: 'Mixers & Garnishes',
    description: 'Everything you need for perfect cocktails',
    image: '/images/products/premium-spirits-wall.webp',
    featured: false
  }
];

export default function CollectionsPage() {
  const featuredCollections = COLLECTIONS.filter(c => c.featured);
  const otherCollections = COLLECTIONS.filter(c => !c.featured);

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation forceScrolled={true} />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/products/premium-spirits-wall.webp"
          alt="Premium Collections"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/70" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
        >
          <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
            CURATED COLLECTIONS
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Thoughtfully assembled selections for every occasion
          </p>
        </motion.div>
      </section>

      {/* Featured Collections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-serif text-4xl text-center text-gray-900 mb-16 tracking-[0.1em]"
          >
            Featured Collections
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredCollections.map((collection, index) => (
              <motion.div
                key={collection.handle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/collections/${collection.handle}`}>
                  <div className="group relative overflow-hidden h-[400px] cursor-pointer">
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="font-serif text-3xl mb-3 tracking-[0.1em] group-hover:text-gold-400 transition-colors">
                        {collection.title}
                      </h3>
                      <p className="text-gray-200 mb-4">
                        {collection.description}
                      </p>
                      <span className="inline-block text-sm tracking-[0.15em] border-b border-gold-400 text-gold-400 group-hover:border-white group-hover:text-white transition-colors">
                        SHOP COLLECTION
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Collections */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-serif text-4xl text-center text-gray-900 mb-16 tracking-[0.1em]"
          >
            More Collections
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {otherCollections.map((collection, index) => (
              <motion.div
                key={collection.handle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/collections/${collection.handle}`}>
                  <div className="bg-white p-8 border border-gray-200 hover:border-gold-600 transition-colors group">
                    <h3 className="font-serif text-2xl text-gray-900 mb-3 tracking-[0.1em] group-hover:text-gold-600 transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {collection.description}
                    </p>
                    <span className="inline-block text-sm tracking-[0.15em] text-gold-600 group-hover:text-gold-700 transition-colors">
                      VIEW COLLECTION →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gold-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-4xl mb-6 tracking-[0.1em]">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            We can create custom packages tailored to your specific event needs
          </p>
          <Link href="/contact">
            <button className="px-8 py-4 bg-white text-gold-600 hover:bg-gray-100 transition-colors tracking-[0.15em]">
              CONTACT US
            </button>
          </Link>
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
                <li><Link href="/collections" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Collections</Link></li>
                <li><Link href="/collections/wedding-packages" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Wedding Packages</Link></li>
                <li><Link href="/collections/premium-spirits" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Premium Spirits</Link></li>
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
    </div>
  );
}