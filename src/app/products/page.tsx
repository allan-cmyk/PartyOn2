'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import ProductCard from '@/components/shopify/ProductCard';
import { useProducts } from '@/lib/shopify/hooks/useProducts';
import { shopifyFetch } from '@/lib/shopify/client';
import { SEARCH_PRODUCTS_QUERY } from '@/lib/shopify/queries/products';
import { ShopifyProduct } from '@/lib/shopify/types';
import AIConcierge from '@/components/AIConcierge';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { products, loading, error, hasNextPage, loadMore } = useProducts(20);
  const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Search for products if search query exists
  useEffect(() => {
    if (searchQuery) {
      setSearchLoading(true);
      shopifyFetch<{ products: { edges: Array<{ node: ShopifyProduct }> } }>({
        query: SEARCH_PRODUCTS_QUERY,
        variables: { query: searchQuery, first: 50 },
      })
        .then(response => {
          setSearchResults(response.products.edges.map(edge => edge.node));
        })
        .catch(console.error)
        .finally(() => setSearchLoading(false));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Use search results if available, otherwise use regular products
  const displayProducts = searchQuery ? searchResults : products;

  // Filter products based on type
  const filteredProducts = displayProducts.filter(product => {
    if (filter === 'all') return true;
    
    const productType = product.productType?.toLowerCase() || '';
    const productTitle = product.title.toLowerCase();
    const productTags = product.tags || [];
    const tagsLower = productTags.map(tag => tag.toLowerCase());
    
    if (filter === 'spirits') {
      return productType.includes('liquor') || 
             productType.includes('spirit') || 
             productType.includes('whiskey') || 
             productType.includes('vodka') ||
             productType.includes('tequila') ||
             productType.includes('rum') ||
             productType.includes('bourbon') ||
             productType.includes('gin') ||
             productTitle.includes('whiskey') ||
             productTitle.includes('vodka') ||
             productTitle.includes('tequila') ||
             productTitle.includes('rum') ||
             productTitle.includes('bourbon') ||
             productTitle.includes('gin') ||
             productTitle.includes('mezcal') ||
             tagsLower.some(tag => ['spirits', 'liquor', 'whiskey', 'vodka', 'tequila', 'rum', 'bourbon', 'gin'].includes(tag));
    }
    
    if (filter === 'wine') {
      return productType.includes('wine') || 
             productType.includes('champagne') ||
             productType.includes('prosecco') ||
             productTitle.includes('wine') ||
             productTitle.includes('champagne') ||
             productTitle.includes('prosecco') ||
             productTitle.includes('rosé') ||
             productTitle.includes('pinot') ||
             productTitle.includes('cabernet') ||
             productTitle.includes('chardonnay') ||
             productTitle.includes('sauvignon') ||
             productTitle.includes('merlot') ||
             tagsLower.some(tag => ['wine', 'champagne', 'prosecco', 'red wine', 'white wine', 'rosé'].includes(tag));
    }
    
    if (filter === 'beer') {
      return productType.includes('beer') || 
             productType.includes('seltzer') ||
             productTitle.includes('beer') ||
             productTitle.includes('seltzer') ||
             productTitle.includes('ipa') ||
             productTitle.includes('lager') ||
             productTitle.includes('ale') ||
             productTitle.includes('stout') ||
             productTitle.includes('pilsner') ||
             productTitle.includes('corona') ||
             productTitle.includes('ranch water') ||
             productTitle.includes('ranch rider') ||
             tagsLower.some(tag => ['beer', 'seltzer', 'hard seltzer', 'ipa', 'lager', 'ale'].includes(tag));
    }
    
    if (filter === 'packages') {
      return productType.includes('package') || 
             productType.includes('bundle') ||
             productType.includes('pack') ||
             productTitle.includes('pack') ||
             productTitle.includes('bundle') ||
             productTitle.includes('package') ||
             productTitle.includes('case');
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
    }
    if (sortBy === 'price-desc') {
      return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
    }
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    return 0; // featured
  });

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <OldFashionedNavigation />
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-red-50 border border-red-200 p-6 rounded">
            <h2 className="text-red-800 font-serif text-xl mb-2">Error Loading Products</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/products/premium-spirits-wall.webp"
          alt="Premium Spirits Collection"
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
            CURATED COLLECTION
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Premium Spirits & Fine Wines for Distinguished Celebrations
          </p>
        </motion.div>
      </section>

      {/* Search Results Heading */}
      {searchQuery && (
        <section className="bg-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-gray-600">
              {searchResults.length} results for <span className="font-medium text-gray-900">&quot;{searchQuery}&quot;</span>
            </p>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'all', label: 'All Products' },
                { value: 'spirits', label: 'Spirits' },
                { value: 'wine', label: 'Wine' },
                { value: 'beer', label: 'Beer' },
                { value: 'packages', label: 'Packages' }
              ].map((category) => (
                <button
                  key={category.value}
                  onClick={() => setFilter(category.value)}
                  className={`px-6 py-2 text-sm tracking-[0.1em] transition-all duration-300 ${
                    filter === category.value
                      ? 'bg-gold-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:border-gold-600'
                  }`}
                >
                  {category.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 tracking-[0.1em]">SORT BY:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 px-4 py-2 text-sm tracking-[0.05em] focus:border-gold-600 focus:outline-none"
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

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="bg-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-8 text-xs">
            <p>Total products: {displayProducts.length}</p>
            <p>Filtered products: {filteredProducts.length}</p>
            <p>Current filter: {filter}</p>
            <details>
              <summary>Product Types</summary>
              <pre>{JSON.stringify([...new Set(displayProducts.map(p => p.productType))].filter(Boolean).sort(), null, 2)}</pre>
            </details>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          {(loading || searchLoading) && products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {sortedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-light text-lg">No products found in this category.</p>
                </div>
              )}

              {/* Load More */}
              {hasNextPage && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors duration-300 tracking-[0.15em] text-sm disabled:opacity-50"
                  >
                    {loading ? 'LOADING...' : 'LOAD MORE'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Service Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <svg className="w-12 h-12 mx-auto text-gold-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">72-Hour Notice</h3>
              <p className="text-gray-600 text-sm">Advance booking ensures availability for your celebration</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <svg className="w-12 h-12 mx-auto text-gold-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">Age Verified</h3>
              <p className="text-gray-600 text-sm">Secure ID verification for all alcohol deliveries</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <svg className="w-12 h-12 mx-auto text-gold-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">Austin Coverage</h3>
              <p className="text-gray-600 text-sm">Delivering excellence throughout greater Austin</p>
            </motion.div>
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
                <li><Link href="/products?filter=spirits" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Spirits</Link></li>
                <li><Link href="/products?filter=wine" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Wine</Link></li>
                <li><Link href="/products?filter=packages" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Packages</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: hello@partyondelivery.com</li>
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
      
      {/* AI Concierge */}
      <AIConcierge mode="elegant" />
    </div>
  );
}