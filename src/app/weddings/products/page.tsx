'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/shopify/hooks/useCart';

export default function WeddingProductsPage() {
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
      title: "Wedding Essentials",
      description: "Everything you need for the perfect wedding bar",
      products: [
        {
          id: 'wedding-champagne-1',
          title: 'Moët & Chandon Impérial',
          price: '$65',
          image: '/images/products/champagne-moet.webp',
          description: 'Classic champagne for toasts'
        },
        {
          id: 'wedding-champagne-2',
          title: 'Veuve Clicquot Yellow Label',
          price: '$75',
          image: '/images/products/champagne-veuve.webp',
          description: 'Premium champagne selection'
        },
        {
          id: 'wedding-wine-1',
          title: 'Caymus Cabernet Sauvignon',
          price: '$95',
          image: '/images/products/wine-red-premium.webp',
          description: 'Napa Valley excellence'
        },
        {
          id: 'wedding-wine-2',
          title: 'Cakebread Chardonnay',
          price: '$55',
          image: '/images/products/wine-white-premium.webp',
          description: 'Elegant white wine'
        }
      ]
    },
    {
      title: "Signature Cocktail Bar",
      description: "Premium spirits for custom cocktails",
      products: [
        {
          id: 'wedding-spirit-1',
          title: 'Grey Goose Vodka',
          price: '$45',
          image: '/images/products/vodka-premium.webp',
          description: 'French premium vodka'
        },
        {
          id: 'wedding-spirit-2',
          title: 'Hendrick\'s Gin',
          price: '$42',
          image: '/images/products/gin-premium.webp',
          description: 'Distinctive Scottish gin'
        },
        {
          id: 'wedding-spirit-3',
          title: 'Patrón Silver Tequila',
          price: '$55',
          image: '/images/products/tequila-patron.webp',
          description: 'Ultra-premium tequila'
        },
        {
          id: 'wedding-spirit-4',
          title: 'Macallan 12 Year',
          price: '$85',
          image: '/images/products/whiskey-macallan.webp',
          description: 'Single malt Scotch'
        }
      ]
    },
    {
      title: "Reception Packages",
      description: "Complete bar solutions for your reception",
      products: [
        {
          id: 'wedding-package-1',
          title: 'Classic Bar Package (50 guests)',
          price: '$1,299',
          image: '/images/products/bar-package-classic.webp',
          description: 'Beer, wine, and standard spirits'
        },
        {
          id: 'wedding-package-2',
          title: 'Premium Bar Package (50 guests)',
          price: '$1,899',
          image: '/images/products/bar-package-premium.webp',
          description: 'Top-shelf spirits and wines'
        },
        {
          id: 'wedding-package-3',
          title: 'Champagne Toast (100 guests)',
          price: '$650',
          image: '/images/products/champagne-toast.webp',
          description: 'Moët for ceremonial toasts'
        },
        {
          id: 'wedding-package-4',
          title: 'Wine Service (100 guests)',
          price: '$850',
          image: '/images/products/wine-service.webp',
          description: 'Red and white selection'
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
          src="/images/services/weddings/outdoor-bar-setup.webp"
          alt="Wedding Bar Setup"
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
            WEDDING COLLECTION
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Curated selections for your perfect day
          </p>
        </motion.div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/weddings" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                ← Back to Weddings
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
      <section className="py-16 bg-gradient-to-br from-gold-50 to-gold-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
            Need a Custom Quote?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our wedding specialists can help create the perfect bar experience for your special day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] font-medium">
                GET CUSTOM QUOTE
              </button>
            </Link>
            <Link href="/weddings/packages/classic">
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