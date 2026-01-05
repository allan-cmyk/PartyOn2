'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Keg product grid with category tabs
 * Shows in-stock kegs vs request-a-quote kegs
 */

interface Keg {
  name: string;
  size: string;
  inStock: boolean;
  handle?: string;
}

interface Category {
  id: string;
  name: string;
  kegs: Keg[];
}

const CATEGORIES: Category[] = [
  {
    id: 'domestics',
    name: 'Domestic Beers',
    kegs: [
      { name: 'Miller Lite', size: '1/2 barrel', inStock: true, handle: 'miller-lite-keg' },
      { name: 'Bud Light', size: '1/2 barrel', inStock: false },
      { name: 'Coors Light', size: '1/2 barrel', inStock: false },
      { name: 'Michelob Ultra', size: '1/2 barrel', inStock: false },
      { name: 'Budweiser', size: '1/2 barrel', inStock: false },
    ],
  },
  {
    id: 'imports',
    name: 'Import Beers',
    kegs: [
      { name: 'Corona Extra', size: '1/2 barrel', inStock: true, handle: 'corona-extra-1-2-barrel' },
      { name: 'Modelo Especial', size: '1/2 barrel', inStock: false },
      { name: 'Dos Equis Lager', size: '1/2 barrel', inStock: false },
      { name: 'Heineken', size: '1/2 barrel', inStock: false },
      { name: 'Stella Artois', size: '1/2 barrel', inStock: false },
    ],
  },
  {
    id: 'craft',
    name: 'Austin Craft',
    kegs: [
      { name: 'Austin BeerWorks Pearl Snap', size: '1/6 barrel', inStock: true },
      { name: 'Live Oak Hefeweizen', size: '1/6 barrel', inStock: false },
      { name: 'Shiner Bock', size: '1/2 barrel', inStock: false },
      { name: 'Pinthouse Electric Jellyfish', size: '1/6 barrel', inStock: false },
      { name: 'Meanwhile Beer Co.', size: '1/6 barrel', inStock: false },
    ],
  },
];

export default function KegProductGrid() {
  const [activeCategory, setActiveCategory] = useState('domestics');

  const currentCategory = CATEGORIES.find((cat) => cat.id === activeCategory);

  return (
    <section className="py-24">
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
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 tracking-[0.1em] text-sm transition-all duration-300 ${
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
          {currentCategory?.kegs.map((keg, index) => (
            <div
              key={keg.name}
              className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-gold-300 transition-all duration-300"
              style={{
                animation: `result-fade-in 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
                animationDelay: `${index * 50}ms`,
                opacity: 0,
              }}
            >
              <div className="flex justify-between items-start mb-4">
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
          <div className="bg-gray-50 rounded-lg p-8 text-center">
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
