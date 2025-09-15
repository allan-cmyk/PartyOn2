'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/shopify/hooks/useCart';

export default function CorporateProductsPage() {
  const { cart, addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  const handleAddToCart = async (productId: string) => {
    setAddingToCart({ ...addingToCart, [productId]: true });
    // This will be connected to actual Shopify products later
    console.log(`Adding product ${productId} to cart`);
    setTimeout(() => {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }, 1000);
  };

  const curatedCollections = [
    {
      title: "Executive Selections",
      description: "Premium spirits for client entertainment",
      products: [
        {
          id: 'corp-whiskey-1',
          title: 'Executive Whiskey Collection',
          price: '$450',
          image: '/images/products/whiskey-executive.webp',
          description: 'Macallan, Glenfiddich, Balvenie'
        },
        {
          id: 'corp-cognac-1',
          title: 'Hennessy Paradis',
          price: '$650',
          image: '/images/products/cognac-hennessy.webp',
          description: 'Ultra-premium cognac'
        },
        {
          id: 'corp-wine-1',
          title: 'Opus One Cabernet',
          price: '$380',
          image: '/images/products/wine-opus-one.webp',
          description: 'Napa Valley icon'
        },
        {
          id: 'corp-champagne-1',
          title: 'Krug Grande Cuvée',
          price: '$220',
          image: '/images/products/champagne-krug.webp',
          description: 'Prestige champagne'
        }
      ]
    },
    {
      title: "Team Building & Events",
      description: "Perfect for office celebrations",
      products: [
        {
          id: 'corp-beer-1',
          title: 'Local Craft Beer Selection',
          price: '$180',
          image: '/images/products/beer-local-craft.webp',
          description: '48 Austin craft beers'
        },
        {
          id: 'corp-cocktail-1',
          title: 'Cocktail Hour Kit',
          price: '$299',
          image: '/images/products/cocktail-kit.webp',
          description: 'Complete bar setup for 25'
        },
        {
          id: 'corp-wine-2',
          title: 'Wine & Cheese Pairing',
          price: '$425',
          image: '/images/products/wine-cheese.webp',
          description: '8 wines with pairing notes'
        },
        {
          id: 'corp-na-1',
          title: 'Non-Alcoholic Premium',
          price: '$125',
          image: '/images/products/non-alcoholic.webp',
          description: 'Mocktails and sodas'
        }
      ]
    },
    {
      title: "Corporate Packages",
      description: "Comprehensive solutions for business events",
      products: [
        {
          id: 'corp-package-1',
          title: 'Board Meeting Package',
          price: '$899',
          image: '/images/products/package-board.webp',
          description: 'Premium spirits for 12 executives'
        },
        {
          id: 'corp-package-2',
          title: 'Holiday Party (50 employees)',
          price: '$2,499',
          image: '/images/products/package-holiday.webp',
          description: 'Full bar service'
        },
        {
          id: 'corp-package-3',
          title: 'Client Entertainment Suite',
          price: '$1,299',
          image: '/images/products/package-client.webp',
          description: 'Luxury spirits and wine'
        },
        {
          id: 'corp-package-4',
          title: 'Product Launch Event',
          price: '$3,499',
          image: '/images/products/package-launch.webp',
          description: 'Champagne and cocktails for 100'
        }
      ]
    }
  ];

  return (
    <div className="bg-white">
      <OldFashionedNavigation />

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/services/corporate/executive-bar.webp"
          alt="Corporate Bar Setup"
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
          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.15em]">
            CORPORATE COLLECTION
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Premium selections for business excellence
          </p>
        </motion.div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/corporate" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                ← Back to Corporate
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/products" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                Browse All Products
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cart ({cart?.totalQuantity || 0})</span>
              <Link href="/checkout">
                <button className="px-4 py-2 bg-gold-600 text-white text-sm hover:bg-gold-700 transition-colors">
                  CHECKOUT
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      {curatedCollections.map((collection, collectionIndex) => (
        <section key={collection.title} className={`py-16 ${collectionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
                {collection.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {collection.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {collection.products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-64">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-gray-900 mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl text-gold-600">{product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart[product.id]}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                          addingToCart[product.id]
                            ? 'bg-green-600 text-white'
                            : 'bg-gold-600 text-white hover:bg-gold-700'
                        }`}
                      >
                        {addingToCart[product.id] ? 'ADDED!' : 'ADD TO CART'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
            Need a Corporate Account?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Volume discounts and dedicated support for your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] font-medium">
                REQUEST PROPOSAL
              </button>
            </Link>
            <Link href="/partners">
              <button className="px-8 py-4 bg-white text-gold-600 border-2 border-gold-600 hover:bg-gold-50 transition-colors tracking-[0.15em] font-medium">
                PARTNER PROGRAM
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}