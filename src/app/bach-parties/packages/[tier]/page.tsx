'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import ProductCard from '@/components/shopify/ProductCard';
import { useProducts } from '@/lib/shopify/hooks/useProducts';
import { useCartContext } from '@/contexts/CartContext';
import { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice } from '@/lib/shopify/utils';
import { calculatePackageQuantity, getUnitSize } from '@/lib/package-calculations';

interface PackageItem {
  product: ShopifyProduct;
  quantity: number;
  category: string;
}

const PACKAGE_CONFIGS = {
  'essential-celebration': {
    name: 'Essential Celebration',
    description: 'Perfect start to your celebration weekend for up to 15 guests',
    guestCount: 15,
    serviceHours: 4,
    serviceType: 'single-venue',
    categories: {
      spirits: { count: 4, description: 'Premium party spirits' },
      wine: { count: 2, description: 'Celebration wines' },
      champagne: { count: 2, description: 'Toast-worthy champagne' },
      mixers: { count: 4, description: 'Essential mixers' }
    },
    extras: [
      'Delivery to any Austin venue',
      'Champagne toast setup',
      'Party-themed packaging',
      'Celebration playlist suggestions'
    ]
  },
  'vip-experience': {
    name: 'VIP Experience',
    description: 'Elevate your celebration with luxury service for up to 30 guests',
    guestCount: 30,
    serviceHours: 8,
    serviceType: 'multi-venue',
    categories: {
      spirits: { count: 8, description: 'Ultra-premium selection' },
      wine: { count: 4, description: 'Fine wines' },
      champagne: { count: 4, description: 'Premium champagne' },
      beer: { count: 3, description: 'Craft selections' },
      mixers: { count: 8, description: 'Complete mixer bar' }
    },
    extras: [
      'Dedicated party concierge',
      'Custom cocktail creation',
      'Multiple venue delivery',
      'Professional bartender (4 hours)',
      'Signature party favors',
      'VIP treatment throughout',
      'Photo-worthy bar setups',
      'Emergency restocking service'
    ]
  },
  'ultimate-weekend': {
    name: 'Ultimate Weekend',
    description: 'Complete weekend party experience for up to 50 guests',
    guestCount: 50,
    serviceHours: 48,
    serviceType: 'full-weekend',
    categories: {
      spirits: { count: 12, description: 'Unlimited premium spirits' },
      wine: { count: 8, description: 'Wine for every occasion' },
      champagne: { count: 6, description: 'Celebration champagne' },
      beer: { count: 6, description: 'Full beer selection' },
      mixers: { count: 12, description: 'Every mixer imaginable' }
    },
    extras: [
      'Full weekend coverage',
      'Multiple event locations',
      'Team of bartenders',
      'Luxury transportation bar',
      'Exclusive VIP treatment',
      'Custom party packages',
      'Recovery brunch supplies',
      'Professional photographer coordination',
      'Surprise celebration elements',
      '24/7 concierge service'
    ]
  }
};

export default function BachPartyPackagePage() {
  const params = useParams();
  const router = useRouter();
  const tier = params.tier as string;
  const { products, loading } = useProducts(100);
  const { addToCart, loading: cartLoading } = useCartContext();
  const [packageItems, setPackageItems] = useState<PackageItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [addingAll, setAddingAll] = useState(false);

  const config = PACKAGE_CONFIGS[tier as keyof typeof PACKAGE_CONFIGS];

  useEffect(() => {
    if (!config || loading || products.length === 0) return;

    // Curate package based on product types - focus on party favorites
    const curatedPackage: PackageItem[] = [];
    
    // Get spirits - prioritize vodka, tequila, rum for parties
    const spirits = products.filter(p => {
      const type = p.productType?.toLowerCase() || '';
      // Strict productType matching - NO title matching to avoid party supplies
      return (
        type === 'liquor & spirits' ||
        type === 'spirits' ||
        type === 'vodka' || 
        type === 'tequila' || 
        type === 'rum' ||
        type === 'gin' ||
        type === 'whiskey' ||
        type === 'bourbon' ||
        // Also check if type starts with these to catch variations
        type.startsWith('vodka') ||
        type.startsWith('tequila') ||
        type.startsWith('rum') ||
        type.startsWith('gin') ||
        type.startsWith('whiskey') ||
        type.startsWith('bourbon')
      ) && !type.includes('supplies') && !type.includes('accessories');
    });
    
    // Get wines - strict productType matching
    const wines = products.filter(p => {
      const type = p.productType?.toLowerCase() || '';
      return (
        type === 'wine' ||
        type === 'wines' ||
        type === 'red wine' ||
        type === 'white wine' ||
        type === 'rosé wine' ||
        (type.startsWith('wine') && !type.includes('champagne'))
      ) && !type.includes('supplies') && !type.includes('accessories');
    });
    
    // Get champagne separately - strict productType matching
    const champagnes = products.filter(p => {
      const type = p.productType?.toLowerCase() || '';
      // NO title matching to avoid party supplies
      return (
        type === 'champagne' ||
        type === 'sparkling wine' ||
        type === 'prosecco' ||
        type.startsWith('champagne') ||
        type.startsWith('prosecco') ||
        type.startsWith('sparkling')
      ) && !type.includes('supplies') && !type.includes('accessories');
    });
    
    // Get beers - strict productType matching
    const beers = products.filter(p => {
      const type = p.productType?.toLowerCase() || '';
      return (
        type === 'beer' ||
        type === 'beers' ||
        type === 'beer & seltzers' ||
        type === 'beer and seltzers' ||
        type === 'seltzers' ||
        type === 'hard seltzer' ||
        type.startsWith('beer') ||
        type.startsWith('seltzer')
      ) && !type.includes('supplies') && !type.includes('accessories');
    });
    
    // Get mixers - strict productType matching
    const mixers = products.filter(p => {
      const type = p.productType?.toLowerCase() || '';
      return (
        type === 'mixers' ||
        type === 'mixer' ||
        type === 'cocktail mixers' ||
        type.startsWith('mixer') ||
        p.tags.some(tag => tag.toLowerCase() === 'mixer' || tag.toLowerCase() === 'mixers')
      ) && !type.includes('supplies') && !type.includes('accessories');
    });

    // Add spirits to package
    spirits.slice(0, config.categories.spirits.count).forEach(product => {
      const unitSize = getUnitSize(product);
      curatedPackage.push({
        product,
        quantity: calculatePackageQuantity('spirits', config.guestCount, 'bach', config.serviceHours, unitSize),
        category: 'spirits'
      });
    });

    // Add wines
    if (config.categories.wine) {
      wines.slice(0, config.categories.wine.count).forEach(product => {
        const unitSize = getUnitSize(product);
        curatedPackage.push({
          product,
          quantity: calculatePackageQuantity('wine', config.guestCount, 'bach', config.serviceHours, unitSize),
          category: 'wine'
        });
      });
    }

    // Add champagne
    if (config.categories.champagne) {
      champagnes.slice(0, config.categories.champagne.count).forEach(product => {
        const unitSize = getUnitSize(product);
        curatedPackage.push({
          product,
          quantity: calculatePackageQuantity('champagne', config.guestCount, 'bach', config.serviceHours, unitSize),
          category: 'champagne'
        });
      });
    }

    // Add beers
    if (config.categories.beer) {
      beers.slice(0, config.categories.beer.count).forEach(product => {
        const unitSize = getUnitSize(product);
        curatedPackage.push({
          product,
          quantity: calculatePackageQuantity('beer', config.guestCount, 'bach', config.serviceHours, unitSize),
          category: 'beer'
        });
      });
    }

    // Add mixers
    mixers.slice(0, config.categories.mixers.count).forEach(product => {
      const unitSize = getUnitSize(product);
      curatedPackage.push({
        product,
        quantity: calculatePackageQuantity('mixers', config.guestCount, 'bach', config.serviceHours, unitSize),
        category: 'mixers'
      });
    });

    setPackageItems(curatedPackage);

    // Calculate total price
    const total = curatedPackage.reduce((sum, item) => {
      const price = parseFloat(item.product.priceRange.minVariantPrice.amount);
      return sum + (price * item.quantity);
    }, 0);
    setTotalPrice(total);
  }, [products, loading, config]);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updated = [...packageItems];
    updated[index].quantity = Math.max(1, newQuantity);
    setPackageItems(updated);

    // Recalculate total
    const total = updated.reduce((sum, item) => {
      const price = parseFloat(item.product.priceRange.minVariantPrice.amount);
      return sum + (price * item.quantity);
    }, 0);
    setTotalPrice(total);
  };

  const handleRemoveItem = (index: number) => {
    const updated = packageItems.filter((_, i) => i !== index);
    setPackageItems(updated);

    // Recalculate total
    const total = updated.reduce((sum, item) => {
      const price = parseFloat(item.product.priceRange.minVariantPrice.amount);
      return sum + (price * item.quantity);
    }, 0);
    setTotalPrice(total);
  };

  const handleAddAllToCart = async () => {
    setAddingAll(true);
    try {
      for (const item of packageItems) {
        const variant = item.product.variants.edges[0]?.node;
        if (variant) {
          await addToCart(variant.id, item.quantity);
        }
      }
      // Redirect to cart or show success message
      router.push('/products');
    } catch (error) {
      console.error('Error adding items to cart:', error);
    } finally {
      setAddingAll(false);
    }
  };

  if (!config) {
    return (
      <div className="bg-white min-h-screen">
        <OldFashionedNavigation />
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h2 className="font-serif text-2xl text-gray-900 mb-4">Package Not Found</h2>
          <Link href="/bach-parties" className="text-gold-600 hover:text-gold-700">
            Return to Celebration Packages
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <OldFashionedNavigation />
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
          <p className="mt-4 text-gray-600">Creating your perfect celebration package...</p>
        </div>
      </div>
    );
  }

  const categoryGroups = packageItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, PackageItem[]>);

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-8 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-5xl text-gray-900 mb-4 tracking-[0.1em]">
              {config.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">{config.description}</p>
            
            {/* Package Details */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-gray-500 tracking-[0.1em]">GUESTS</p>
                <p className="font-medium text-lg">Up to {config.guestCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 tracking-[0.1em]">SERVICE</p>
                <p className="font-medium text-lg">
                  {config.serviceHours} {config.serviceHours > 24 ? 'Hours' : 'Hours'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 tracking-[0.1em]">TYPE</p>
                <p className="font-medium text-lg capitalize">{config.serviceType.replace('-', ' ')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Package Items */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          {/* Summary Bar */}
          <div className="bg-gradient-to-r from-pink-50 to-gold-50 p-6 mb-12 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-2xl text-gray-900 tracking-[0.1em]">
                Package Total
              </h2>
              <p className="text-3xl text-gold-600 mt-2">
                {formatPrice(totalPrice.toString(), 'USD')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Plus delivery & service fees</p>
              <p className="text-xs text-gray-500 mt-2 max-w-xs">
                * Final price may vary based on product availability and current pricing
              </p>
            </div>
            <button
              onClick={handleAddAllToCart}
              disabled={packageItems.length === 0 || addingAll || cartLoading}
              className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm disabled:opacity-50"
            >
              {addingAll ? 'ADDING TO CART...' : 'ADD ALL TO CART'}
            </button>
          </div>

          {/* Items by Category */}
          {Object.entries(categoryGroups).map(([category, items]) => (
            <div key={category} className="mb-12">
              <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em] capitalize">
                {category}
              </h3>
              <div className="space-y-6">
                {items.map((item, index) => {
                  const globalIndex = packageItems.indexOf(item);
                  return (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white border border-gray-200 p-6"
                    >
                      <div className="flex items-center gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0">
                          {item.product.images.edges.length > 0 ? (
                            <img
                              src={item.product.images.edges[0].node.url}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Link href={`/products/${item.product.handle}`}>
                            <h4 className="font-medium text-lg text-gray-900 hover:text-gold-600 transition-colors">
                              {item.product.title}
                            </h4>
                          </Link>
                          <p className="text-gray-600">
                            {formatPrice(
                              item.product.priceRange.minVariantPrice.amount,
                              item.product.priceRange.minVariantPrice.currencyCode
                            )} each
                          </p>
                          {item.product.vendor && (
                            <p className="text-sm text-gray-500">{item.product.vendor}</p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleQuantityChange(globalIndex, item.quantity - 1)}
                            className="w-10 h-10 border border-gray-300 hover:border-gold-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(globalIndex, item.quantity + 1)}
                            className="w-10 h-10 border border-gray-300 hover:border-gold-600 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            {formatPrice(
                              (parseFloat(item.product.priceRange.minVariantPrice.amount) * item.quantity).toString(),
                              item.product.priceRange.minVariantPrice.currencyCode
                            )}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(globalIndex)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Service Inclusions */}
          <div className="mt-16 bg-gradient-to-r from-pink-50 to-gold-50 p-8">
            <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em]">
              Package Includes
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {config.extras.map((extra, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-700">{extra}</p>
                </div>
              ))}
            </div>

            {/* Party Tips */}
            <div className="mt-8 p-4 bg-white border border-gold-200">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Party Pro Tip</p>
                  <p>Consider adding our signature party punch recipe or custom cocktail menu. Our mixologists can create themed drinks perfect for your celebration!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 flex justify-center space-x-4">
            <button
              onClick={handleAddAllToCart}
              disabled={packageItems.length === 0 || addingAll || cartLoading}
              className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm disabled:opacity-50"
            >
              {addingAll ? 'ADDING TO CART...' : 'ADD PACKAGE TO CART'}
            </button>
            <Link href="/bach-parties">
              <button className="px-8 py-4 border border-gray-300 text-gray-700 hover:border-gold-600 transition-colors tracking-[0.15em] text-sm">
                BACK TO PACKAGES
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.15em]">PARTYON</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier celebration supplier since 2020.
              </p>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CELEBRATIONS</h4>
              <ul className="space-y-2">
                <li><Link href="/bach-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Bach Parties</Link></li>
                <li><Link href="/weddings" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Weddings</Link></li>
                <li><Link href="/boat-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Boat Parties</Link></li>
                <li><Link href="/corporate" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Corporate Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">SHOP</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">All Products</Link></li>
                <li><Link href="/collections" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Collections</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: party@partyondelivery.com</li>
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