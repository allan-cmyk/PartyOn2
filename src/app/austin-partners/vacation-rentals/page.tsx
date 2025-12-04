'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/Footer';
import { useCart } from '@/lib/shopify/hooks/useCart';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

export default function VacationRentalsPartnerPage() {
  const { cart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuickAdd = async (productId: string, productTitle: string) => {
    // This would connect to your Shopify products
    // For now, showing the concept
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    console.log(`Adding ${productTitle} to cart`);
  };

  const categories = [
    {
      title: 'Welcome Packages',
      description: 'Curated selections to greet your guests',
      image: '/images/products/welcome-package.webp',
      link: '/products?collection=welcome-packages',
      products: [
        { id: '1', title: 'Texas Welcome Box', price: '$149', description: 'Local spirits & mixers' },
        { id: '2', title: 'Premium Bar Setup', price: '$299', description: 'Everything for a home bar' },
        { id: '3', title: 'Champagne Arrival', price: '$89', description: 'Moet & treats' }
      ]
    },
    {
      title: 'Party Essentials',
      description: 'Everything for entertaining',
      image: '/images/products/party-essentials.webp',
      link: '/products?collection=party-supplies',
      products: [
        { id: '4', title: 'Cocktail Party Kit', price: '$199', description: 'Serves 10-15 guests' },
        { id: '5', title: 'Beer & Seltzer Pack', price: '$129', description: '48 assorted cans' },
        { id: '6', title: 'Wine Collection', price: '$249', description: '6 curated bottles' }
      ]
    },
    {
      title: 'Premium Spirits',
      description: 'Top-shelf selections',
      image: '/images/products/premium-spirits-wall.webp',
      link: '/products?filter=liquor',
      products: [
        { id: '7', title: 'Tequila Flight', price: '$189', description: 'Blanco, Reposado, Añejo' },
        { id: '8', title: 'Whiskey Selection', price: '$279', description: 'Bourbon & Scotch variety' },
        { id: '9', title: 'Vodka & Gin Bar', price: '$159', description: 'Premium clear spirits' }
      ]
    },
    {
      title: 'Mixers & Extras',
      description: 'Bar accessories and non-alcoholic options',
      image: '/images/products/mixers-garnishes.webp',
      link: '/products?filter=mixers-na',
      products: [
        { id: '10', title: 'Mixer Bundle', price: '$49', description: 'Juices, sodas, tonic' },
        { id: '11', title: 'Garnish Kit', price: '$29', description: 'Fresh citrus & herbs' },
        { id: '12', title: 'Bar Tools Set', price: '$79', description: 'Professional grade tools' }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Minimal branded header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Partner Logo */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-serif text-xl tracking-wide">Austin Luxury Stays</h1>
                  <p className="text-xs text-gray-500">Premium Vacation Rentals</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Powered by</span>
                <Link href="/" className="font-serif text-lg text-gold-600 hover:text-gold-700 transition-colors">
                  PartyOn Delivery
                </Link>
              </div>
            </div>

            {/* Cart button */}
            <Link
              href="/checkout"
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Cart ({cart?.totalQuantity || 0})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/luxury-home-interior.webp"
          alt="Luxury Vacation Rental"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

        <div className="hero-fade-in relative text-center text-white z-10 max-w-4xl mx-auto px-8">

          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.1em]">
            Elevate Your Guest Experience
          </h1>
          <p className="text-lg font-light tracking-wide text-gray-200 mb-8">
            Premium spirits and curated packages delivered to your Austin vacation rental
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="#packages"
              className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-all duration-300 tracking-wider"
            >
              BROWSE PACKAGES
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 transition-all duration-300 tracking-wider"
            >
              SHOP ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Pre-Arrival Delivery</h3>
              <p className="text-sm text-gray-600">Stock before guests arrive</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Age Verified</h3>
              <p className="text-sm text-gray-600">Secure & compliant delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Host Rewards</h3>
              <p className="text-sm text-gray-600">Earn 10% on guest orders</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">5-Star Service</h3>
              <p className="text-sm text-gray-600">Enhance guest reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="packages" className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
              Curated for Your Guests
            </h2>
            <p className="text-lg text-gray-600">
              Premium selections designed for vacation rentals
            </p>
          </div>

          <div className="space-y-16">
            {categories.map((category, index) => (
              <ScrollRevealCSS key={category.title} duration={800} delay={(index % 8) * 100} y={30}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Image */}
                  <div className={`relative h-[400px] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="font-serif text-2xl md:text-3xl mb-3 text-gray-900">{category.title}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {category.products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.title}</h4>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-serif text-lg text-gray-900">{product.price}</span>
                          <button
                            onClick={() => handleQuickAdd(product.id, product.title)}
                            className="px-4 py-2 bg-gold-600 text-gray-900 text-sm hover:bg-gold-700 transition-colors rounded"
                          >
                            ADD
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={category.link}
                    className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-medium"
                  >
                    View All {category.title}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Order CTA */}
      <section className="py-16 bg-gradient-to-br from-gold-50 to-gold-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
            Ready to Order?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Browse our full selection or contact us for custom packages
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-wider font-medium"
            >
              SHOP ALL PRODUCTS
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-gold-600 border-2 border-gold-600 hover:bg-gold-50 transition-colors tracking-wider font-medium"
            >
              CONTACT FOR CUSTOM ORDERS
            </Link>
          </div>
        </div>
      </section>

      {/* Host Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">
                Benefits for Property Hosts
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Increase Booking Value</h3>
                    <p className="text-gray-600">Offer premium amenities that justify higher nightly rates</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Earn Commission</h3>
                    <p className="text-gray-600">10% commission on all guest orders placed through your property link</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Stand Out from Competition</h3>
                    <p className="text-gray-600">Unique amenity that differentiates your listing</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Zero Hassle</h3>
                    <p className="text-gray-600">We handle everything - ordering, delivery, and age verification</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="font-serif text-2xl text-gray-900 mb-6">Partner Dashboard</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Monthly Guest Orders</span>
                    <span className="font-serif text-2xl text-gray-900">$4,250</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gold-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Your Commission</span>
                    <span className="font-serif text-2xl text-gold-600">$425</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Guest Satisfaction</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-gold-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Product added to cart!
        </div>
      )}

      <Footer />
    </div>
  );
}