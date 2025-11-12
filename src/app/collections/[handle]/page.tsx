'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import ProductCard from '@/components/shopify/ProductCard';
import { shopifyFetch } from '@/lib/shopify/client';
import { COLLECTION_BY_HANDLE_QUERY } from '@/lib/shopify/queries/products';
import { ShopifyProduct, ShopifyCollection } from '@/lib/shopify/types';
import { generateItemListSchema } from '@/lib/seo/schemas';

interface CollectionResponse {
  collection: ShopifyCollection & {
    products: {
      edges: Array<{
        node: ShopifyProduct;
      }>;
    };
  };
}

const COLLECTION_INFO = {
  'wedding-packages': {
    title: 'Wedding Packages',
    description: 'Curated bar packages for your special day',
    image: '/images/weddings/wedding-bar-setup-golden.webp'
  },
  'premium-spirits': {
    title: 'Premium Spirits',
    description: 'Top-shelf liquors for discerning tastes',
    image: '/images/products/premium-spirits-wall.webp'
  },
  'wine-collection': {
    title: 'Fine Wines',
    description: 'Carefully selected wines from renowned vineyards',
    image: '/images/hero/wine-glasses.webp'
  },
  'craft-beer': {
    title: 'Craft Beer',
    description: 'Local and imported craft beer selection',
    image: '/images/hero/lake-travis-sunset.webp'
  },
  'party-packages': {
    title: 'Party Packages',
    description: 'Everything you need for the perfect celebration',
    image: '/images/boat-parties/boat-party-bar-setup.webp'
  }
};

export default function CollectionPage() {
  const params = useParams();
  const handle = params.handle as string;
  const [collection, setCollection] = useState<CollectionResponse['collection'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await shopifyFetch<CollectionResponse>({
          query: COLLECTION_BY_HANDLE_QUERY,
          variables: { handle, first: 50 },
        });
        setCollection(response.collection);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [handle]);

  // Inject ItemList schema after collection data loads
  useEffect(() => {
    if (!collection || !collection.products?.edges) return;

    // Generate schema data from products
    const items = collection.products.edges.map(({ node }) => ({
      name: node.title,
      url: `https://partyondelivery.com/products/${node.handle}`,
      image: node.images?.edges?.[0]?.node?.url,
      price: node.priceRange?.minVariantPrice?.amount
    }));

    const schema = generateItemListSchema(items);

    // Remove existing schema if present
    const existingScript = document.getElementById('collection-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Inject new schema
    const script = document.createElement('script');
    script.id = 'collection-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.getElementById('collection-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [collection]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <OldFashionedNavigation />
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="bg-white min-h-screen">
        <OldFashionedNavigation />
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <h2 className="font-serif text-2xl text-gray-900 mb-4">Collection Not Found</h2>
            <Link href="/products" className="text-gold-600 hover:text-gold-700">
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const collectionInfo = COLLECTION_INFO[handle as keyof typeof COLLECTION_INFO] || {
    title: collection.title,
    description: collection.description,
    image: '/images/products/premium-spirits-wall.webp'
  };

  // Sort products
  const products = [...(collection.products?.edges.map(edge => edge.node) || [])];
  const sortedProducts = products.sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
    }
    if (sortBy === 'price-desc') {
      return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
    }
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src={collectionInfo.image}
          alt={collectionInfo.title}
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
          <h1 className="font-serif font-light text-5xl md:text-7xl mb-6 tracking-[0.15em]">
            {collectionInfo.title.toUpperCase()}
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            {collectionInfo.description}
          </p>
        </motion.div>
      </section>

      {/* Sort Bar */}
      <section className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-gold-600"
              >
                <option value="featured">Featured</option>
                <option value="name">Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          {sortedProducts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-8">No products found in this collection</p>
              <Link href="/products" className="text-gold-600 hover:text-gold-700">
                Browse All Products
              </Link>
            </div>
          )}
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
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">COLLECTIONS</h4>
              <ul className="space-y-2">
                <li><Link href="/collections/wedding-packages" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Wedding Packages</Link></li>
                <li><Link href="/collections/premium-spirits" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Premium Spirits</Link></li>
                <li><Link href="/collections/wine-collection" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Fine Wines</Link></li>
                <li><Link href="/collections/party-packages" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Party Packages</Link></li>
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