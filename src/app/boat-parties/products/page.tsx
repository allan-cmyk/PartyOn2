'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/shopify/hooks/useCart';

export default function BoatPartiesProductsPage() {
  const { cart } = useCart();
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
      title: "Lake Day Essentials",
      description: "Perfect for a day on Lake Travis",
      products: [
        {
          id: 'boat-beer-1',
          title: 'Corona Premier 24-Pack',
          price: '$45',
          image: '/images/products/beer-corona.webp',
          description: 'Light & refreshing'
        },
        {
          id: 'boat-seltzer-1',
          title: 'White Claw Variety 24-Pack',
          price: '$40',
          image: '/images/products/seltzer-whiteclaw.webp',
          description: 'Hard seltzer variety'
        },
        {
          id: 'boat-wine-1',
          title: 'Rosé All Day Collection',
          price: '$120',
          image: '/images/products/wine-rose.webp',
          description: '6 bottles of premium rosé'
        },
        {
          id: 'boat-rtd-1',
          title: 'Ranch Water 12-Pack',
          price: '$35',
          image: '/images/products/ranch-water.webp',
          description: 'Texas favorite'
        }
      ]
    },
    {
      title: "Yacht Club Premium",
      description: "Elevated selections for luxury vessels",
      products: [
        {
          id: 'yacht-champagne-1',
          title: 'Dom Pérignon',
          price: '$350',
          image: '/images/products/champagne-dom.webp',
          description: 'Ultimate luxury'
        },
        {
          id: 'yacht-vodka-1',
          title: 'Belvedere Magnum',
          price: '$125',
          image: '/images/products/vodka-belvedere.webp',
          description: '1.75L premium vodka'
        },
        {
          id: 'yacht-tequila-1',
          title: 'Clase Azul Reposado',
          price: '$180',
          image: '/images/products/tequila-clase-azul.webp',
          description: 'Ultra-premium tequila'
        },
        {
          id: 'yacht-whiskey-1',
          title: 'Johnnie Walker Blue',
          price: '$250',
          image: '/images/products/whiskey-blue-label.webp',
          description: 'Rare Scotch whisky'
        }
      ]
    },
    {
      title: "Party Packages",
      description: "Everything for your boat party",
      products: [
        {
          id: 'boat-package-1',
          title: 'Pontoon Party Pack (10 guests)',
          price: '$399',
          image: '/images/products/package-pontoon.webp',
          description: 'Beer, seltzers, and snacks'
        },
        {
          id: 'boat-package-2',
          title: 'Yacht Club Package (20 guests)',
          price: '$899',
          image: '/images/products/package-yacht.webp',
          description: 'Premium spirits and champagne'
        },
        {
          id: 'boat-package-3',
          title: 'Sunset Cruise Collection',
          price: '$299',
          image: '/images/products/package-sunset.webp',
          description: 'Wine and cocktails for 8'
        },
        {
          id: 'boat-package-4',
          title: 'Lake Travis Cooler',
          price: '$199',
          image: '/images/products/cooler-package.webp',
          description: 'Cooler + ice + drinks'
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
          src="/images/services/boat-parties/yacht-bar-setup.webp"
          alt="Boat Party Bar"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

        <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-8 hero-fade-in">
          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.15em]">
            LAKE TRAVIS COLLECTION
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Premium spirits delivered to your vessel
          </p>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/boat-parties" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                ← Back to Boat Parties
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
            <ScrollRevealCSS
              duration={800}
              y={20}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
                {collection.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {collection.description}
              </p>
            </ScrollRevealCSS>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {collection.products.map((product, index) => (
                <ScrollRevealCSS
                  key={product.id}
                  duration={500}
                  y={20}
                  delay={index * 100}
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
                </ScrollRevealCSS>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
            Planning a Yacht Party?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let us handle the bar service for your Lake Travis adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] font-medium">
                GET CUSTOM QUOTE
              </button>
            </Link>
            <Link href="/boat-parties/packages/luxury">
              <button className="px-8 py-4 bg-white text-gold-600 border-2 border-gold-600 hover:bg-gold-50 transition-colors tracking-[0.15em] font-medium">
                VIEW PACKAGES
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}