'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/shopify/hooks/useCart';

export default function BachPartiesProductsPage() {
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
      title: "Bachelorette Favorites",
      description: "Pretty drinks for the perfect party",
      products: [
        {
          id: 'bach-champagne-1',
          title: 'Rosé Champagne Collection',
          price: '$185',
          image: '/images/products/champagne-rose.webp',
          description: '3 bottles of pink bubbly'
        },
        {
          id: 'bach-cocktail-1',
          title: 'Aperol Spritz Kit',
          price: '$95',
          image: '/images/products/aperol-kit.webp',
          description: 'Aperol + Prosecco + soda'
        },
        {
          id: 'bach-wine-1',
          title: 'Girls Night Wine Set',
          price: '$150',
          image: '/images/products/wine-variety.webp',
          description: '6 bottles of favorites'
        },
        {
          id: 'bach-vodka-1',
          title: 'Pink Whitney Bundle',
          price: '$75',
          image: '/images/products/pink-whitney.webp',
          description: 'Fun pink lemonade vodka'
        }
      ]
    },
    {
      title: "Bachelor Party Essentials",
      description: "Bold choices for the boys",
      products: [
        {
          id: 'bachelor-whiskey-1',
          title: 'Whiskey Tasting Flight',
          price: '$225',
          image: '/images/products/whiskey-flight.webp',
          description: '5 premium whiskeys'
        },
        {
          id: 'bachelor-beer-1',
          title: 'Craft Beer Collection',
          price: '$120',
          image: '/images/products/beer-craft.webp',
          description: '48 local craft beers'
        },
        {
          id: 'bachelor-tequila-1',
          title: 'Tequila & Mezcal Set',
          price: '$195',
          image: '/images/products/tequila-mezcal.webp',
          description: 'Premium agave spirits'
        },
        {
          id: 'bachelor-bourbon-1',
          title: 'Bourbon Collection',
          price: '$280',
          image: '/images/products/bourbon-collection.webp',
          description: 'Texas & Kentucky finest'
        }
      ]
    },
    {
      title: "Party Packages",
      description: "Complete solutions for your celebration",
      products: [
        {
          id: 'bach-package-1',
          title: 'Bachelorette Weekend (12 guests)',
          price: '$799',
          image: '/images/products/package-bachelorette.webp',
          description: 'Champagne, wine, and cocktails'
        },
        {
          id: 'bach-package-2',
          title: 'Bachelor Party Pack (12 guests)',
          price: '$899',
          image: '/images/products/package-bachelor.webp',
          description: 'Beer, whiskey, and shots'
        },
        {
          id: 'bach-package-3',
          title: 'Pool Party Collection',
          price: '$499',
          image: '/images/products/package-pool-party.webp',
          description: 'Seltzers, cocktails, and floats'
        },
        {
          id: 'bach-package-4',
          title: 'Night Out Pregame',
          price: '$299',
          image: '/images/products/package-pregame.webp',
          description: 'Shots and energy drinks'
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
          src="/images/services/bach-parties/party-setup.webp"
          alt="Bach Party Setup"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

        <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-8 hero-fade-in">
          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.15em]">
            BACH PARTY COLLECTION
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Unforgettable celebrations start here
          </p>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/bach-parties" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                ← Back to Bach Parties
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
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
            Make It Unforgettable
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Custom packages and party planning for your Austin celebration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] font-medium">
                GET PARTY QUOTE
              </button>
            </Link>
            <Link href="/bach-parties/packages/ultimate">
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