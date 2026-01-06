'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Keg product grid with category tabs
 * Shows in-stock kegs vs request-a-quote kegs with prices from Shopify
 */

interface Keg {
  name: string;
  size: string;
  price?: string;
  inStock: boolean;
  handle?: string;
  category: 'domestics' | 'imports' | 'craft';
}

const ALL_KEGS: Keg[] = [
  // Domestics
  { name: 'Miller Lite', size: '1/2 barrel', price: '$174.99', inStock: true, handle: 'miller-lite-keg', category: 'domestics' },
  { name: 'Miller Lite', size: '1/4 barrel', price: '$109.99', inStock: true, handle: 'miller-lite-keg-1-4-barrel-5-5-gal', category: 'domestics' },
  { name: 'Michelob Ultra', size: '1/2 barrel', price: '$189.00', inStock: true, handle: 'michelob-ultra-1-2-barrel', category: 'domestics' },
  { name: 'Lone Star', size: '1/2 barrel', price: '$163.99', inStock: true, handle: 'lone-star-keg-1-2-barrel', category: 'domestics' },
  { name: 'Bud Light', size: '1/2 barrel', inStock: false, category: 'domestics' },
  { name: 'Coors Light', size: '1/2 barrel', inStock: false, category: 'domestics' },
  { name: 'Budweiser', size: '1/2 barrel', inStock: false, category: 'domestics' },

  // Imports
  { name: 'Corona Extra', size: '1/2 barrel', price: '$189.99', inStock: true, handle: 'corona-extra-1-2-barrel', category: 'imports' },
  { name: 'Modelo Especial', size: '1/2 barrel', price: '$189.99', inStock: true, handle: 'modelo-especial-keg-1-2-barrel-15-5gallons', category: 'imports' },
  { name: 'Dos Equis', size: '1/2 barrel', price: '$214.99', inStock: true, handle: 'miller-lite-keg-1-2-barrel-11-gal-copy', category: 'imports' },
  { name: 'Dos Equis', size: '1/6 barrel', price: '$89.99', inStock: true, handle: 'dos-equis-lager-1-6', category: 'imports' },
  { name: 'Dos Equis Slim', size: '20L', price: '$84.99', inStock: true, handle: 'dos-equis-keg-slim-keg-20l', category: 'imports' },
  { name: 'Heineken', size: '1/2 barrel', inStock: false, category: 'imports' },
  { name: 'Stella Artois', size: '1/2 barrel', inStock: false, category: 'imports' },

  // Craft
  { name: 'Austin BeerWorks Pearl Snap', size: '1/6 barrel', price: '$94.99', inStock: true, handle: 'austin-beer-works-pearl-snaps-1-6', category: 'craft' },
  { name: 'Karbach Love Street', size: '1/2 barrel', price: '$274.99', inStock: true, handle: 'karbach-love-street-1-2-barrell', category: 'craft' },
  { name: 'Karbach Hopadillo', size: '1/6 barrel', price: '$109.99', inStock: true, handle: 'karbach-hopadillo-1-6-barrel', category: 'craft' },
  { name: 'Shiner Light Blonde', size: '1/2 barrel', price: '$189.00', inStock: true, handle: 'shiner-light-blonde-keg', category: 'craft' },
  { name: 'Blue Moon Belgian White', size: '1/6 barrel', price: '$89.99', inStock: true, handle: 'blue-moon-belgian-white-1-6-barrel', category: 'craft' },
  { name: 'Yuengling', size: '1/4 barrel', price: '$114.99', inStock: true, handle: 'yuengling-slim-1-4-barrel', category: 'craft' },
  { name: 'Franziskaner Hefeweizen', size: '13.2 gal', price: '$199.00', inStock: true, handle: 'franziskaner-hefeweizen-13-2g-keg', category: 'craft' },
  { name: 'Live Oak Hefeweizen', size: '1/6 barrel', inStock: false, category: 'craft' },
  { name: 'Pinthouse Electric Jellyfish', size: '1/6 barrel', inStock: false, category: 'craft' },
];

const CATEGORIES = [
  { id: 'all', name: 'All Kegs' },
  { id: 'domestics', name: 'Domestic' },
  { id: 'imports', name: 'Import' },
  { id: 'craft', name: 'Craft' },
];

export default function KegProductGrid() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredKegs = activeCategory === 'all'
    ? ALL_KEGS
    : ALL_KEGS.filter(keg => keg.category === activeCategory);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-8">
        <ScrollRevealCSS duration={800} y={20} className="text-center mb-12">
          <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
            Available Kegs
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            In-stock kegs available for delivery. Can&apos;t find your brand?
            Request a quote and we&apos;ll source it for you.
          </p>
        </ScrollRevealCSS>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 tracking-[0.1em] text-sm transition-all duration-300 rounded ${
                activeCategory === category.id
                  ? 'bg-gold-600 text-gray-900'
                  : 'border border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900'
              }`}
            >
              {category.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Keg Grid */}
        <div
          key={activeCategory}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{
            animation: 'result-fade-in 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
          }}
        >
          {filteredKegs.map((keg, index) => (
            <div
              key={`${keg.name}-${keg.size}`}
              className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-gold-300 transition-all duration-300"
              style={{
                animation: `result-fade-in 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
                animationDelay: `${index * 30}ms`,
                opacity: 0,
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-serif text-xl text-gray-900 tracking-[0.05em]">
                    {keg.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{keg.size}</p>
                </div>
                {keg.inStock ? (
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    In Stock
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                    Request Quote
                  </span>
                )}
              </div>

              {/* Price */}
              {keg.price && (
                <p className="text-2xl font-medium text-gold-600 mb-4">
                  {keg.price}
                </p>
              )}
              {!keg.price && (
                <p className="text-lg text-gray-400 mb-4 italic">
                  Price on request
                </p>
              )}

              {keg.inStock && keg.handle ? (
                <Link
                  href={`/products/${keg.handle}`}
                  className="block w-full py-2 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium text-center rounded"
                >
                  VIEW & ORDER
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className="block w-full py-2 border border-gold-600 text-gray-900 hover:bg-gold-600 transition-colors tracking-[0.1em] text-sm font-medium text-center rounded"
                >
                  REQUEST QUOTE
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bulk Order CTA */}
        <ScrollRevealCSS duration={800} y={20} delay={300} className="mt-12">
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
              Need Multiple Kegs or a Special Brand?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Planning a large event? We can source almost any beer and offer
              volume discounts for orders of 3+ kegs.
            </p>
            <a
              href="tel:7373719700"
              className="inline-block px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded"
            >
              CALL (737) 371-9700
            </a>
          </div>
        </ScrollRevealCSS>
      </div>
    </section>
  );
}
