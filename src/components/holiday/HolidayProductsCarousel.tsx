'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { shopifyFetch, PRODUCTS_BY_HANDLES_QUERY } from '@/lib/shopify';
import { ShopifyProduct } from '@/lib/shopify/types';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

// Holiday product handles - these should match exact Shopify handles
const HOLIDAY_PRODUCT_HANDLES = [
  'peppermint-martini',
  'apple-cider-aperol-cider-bundle',
  'pumpkin-spice-old-fashioned-1',
  'cranberry-ginger-fizz-mocktail-kit',
  'hugo-spritz-cocktail-kit',
  'the-hill-country-old-fashioned',
];

interface ProductNode {
  node: ShopifyProduct;
}

interface ProductsResponse {
  products: {
    edges: ProductNode[];
  };
}

export default function HolidayProductsCarousel(): React.ReactElement {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchHolidayProducts(): Promise<void> {
      try {
        // Build query string for Shopify - OR together multiple handle searches
        const handleQuery = HOLIDAY_PRODUCT_HANDLES.map(h => `handle:${h}`).join(' OR ');

        const response = await shopifyFetch<ProductsResponse>({
          query: PRODUCTS_BY_HANDLES_QUERY,
          variables: {
            query: handleQuery,
            first: 20,
          },
        });

        if (response?.products?.edges) {
          // Sort products to match our desired order
          const productMap = new Map<string, ShopifyProduct>();
          response.products.edges.forEach(({ node }) => {
            productMap.set(node.handle, node);
          });

          // Return in our preferred order
          const orderedProducts = HOLIDAY_PRODUCT_HANDLES
            .map(handle => productMap.get(handle))
            .filter((p): p is ShopifyProduct => p !== undefined);

          setProducts(orderedProducts);
        }
      } catch (err) {
        console.error('Error fetching holiday products:', err);
        setError('Unable to load holiday products');
      } finally {
        setLoading(false);
      }
    }

    fetchHolidayProducts();
  }, []);

  const scroll = (direction: 'left' | 'right'): void => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Card width + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (amount: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="w-16 h-px bg-gray-300 mx-auto" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-72 bg-white rounded-lg shadow-sm p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return <></>;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <ScrollRevealCSS duration={600} y={20} className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
            Holiday Cocktail Kits & Gift Baskets
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Perfect additions to your holiday party order. All kits include everything you need to mix amazing cocktails.
          </p>
        </ScrollRevealCSS>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 -ml-4 transition-all hover:scale-110 hidden sm:block"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Products Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => {
              const imageUrl = product.images?.edges?.[0]?.node?.url;
              const price = product.priceRange?.minVariantPrice?.amount;
              const isAvailable = product.variants?.edges?.[0]?.node?.availableForSale;

              return (
                <ScrollRevealCSS key={product.id} duration={600} delay={index * 50} y={20}>
                  <Link
                    href={`/products/${product.handle}`}
                    className="flex-shrink-0 w-72 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group block"
                  >
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          sizes="288px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium px-4 py-2 bg-black/70 rounded">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-serif text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-900">
                          {price ? formatPrice(price) : 'Price unavailable'}
                        </span>
                        <span className="text-sm text-gold-600 font-medium group-hover:underline">
                          View Product
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollRevealCSS>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 -mr-4 transition-all hover:scale-110 hidden sm:block"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mobile swipe hint */}
        <p className="text-center text-sm text-gray-500 mt-4 sm:hidden">
          Swipe to see more
        </p>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-block border-2 border-gold-600 text-gold-600 px-8 py-3 tracking-[0.1em] hover:bg-gold-600 hover:text-white transition-colors font-medium"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>
    </section>
  );
}
