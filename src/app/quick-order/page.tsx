/**
 * @fileoverview Quick Order page - streamlined product ordering with site navigation
 * @module app/quick-order/page
 */

'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';
import { SHOPIFY_COLLECTIONS } from '@/lib/shopify/categories';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * Quick Order page with site navigation, hero, and streamlined ordering
 */
export default function QuickOrderPage(): ReactElement {
  const [activeCollection, setActiveCollection] = useState('favorites-home-page');
  const { products, loading, error } = useQuickOrderProducts(activeCollection);
  const isMobile = useIsMobile();

  // Sticky collections state
  const [isCollectionsSticky, setIsCollectionsSticky] = useState(false);
  const collectionsRef = useRef<HTMLElement>(null);
  const collectionsInitialTopRef = useRef<number>(0);

  // Store initial position of collections section
  useEffect(() => {
    if (!collectionsRef.current) return;
    const rect = collectionsRef.current.getBoundingClientRect();
    collectionsInitialTopRef.current = rect.top + window.scrollY;
  }, []);

  // Sticky collections detection
  useEffect(() => {
    if (collectionsInitialTopRef.current === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Account for nav height (96px on desktop, smaller on mobile)
      const navHeight = isMobile ? 64 : 96;
      setIsCollectionsSticky(scrollY > collectionsInitialTopRef.current - navHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const handleCollectionChange = (handle: string) => {
    if (activeCollection === handle) {
      // Don't toggle off - always keep a collection selected
      return;
    }
    setActiveCollection(handle);
  };

  const clearCollection = () => {
    setActiveCollection('favorites-home-page');
  };

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation forceScrolled={true} />

      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[40vh] mt-24 flex items-center justify-center overflow-hidden">
        <Image
          src="/images/products/premium-spirits-wall.webp"
          alt="Premium Spirits Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

        <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-6">
          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.15em]">
            Premium Spirits & Party Essentials
          </h1>
          <div className="w-20 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-base md:text-lg font-light tracking-[0.1em] text-gray-200">
            For whatever you&apos;re planning
            <br />
            Find something everyone will enjoy
          </p>
        </div>
      </section>

      {/* Featured Collections - Sticky */}
      <section
        ref={collectionsRef}
        className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ${
          isCollectionsSticky
            ? 'sticky top-24 md:top-24 z-40 py-3 shadow-md'
            : 'py-6'
        }`}
      >
        <div className={isMobile ? 'px-4' : 'max-w-7xl mx-auto px-8'}>
          {/* Header - hide when sticky */}
          {!isCollectionsSticky && (
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-serif ${isMobile ? 'text-lg' : 'text-xl'} text-gray-900 tracking-[0.1em]`}>
                FEATURED COLLECTIONS
              </h3>
              {activeCollection !== 'favorites-home-page' && (
                <button
                  onClick={clearCollection}
                  className="text-sm text-gold-600 hover:text-gold-700 tracking-[0.1em]"
                >
                  CLEAR COLLECTION
                </button>
              )}
            </div>
          )}

          {/* Collections Grid/Horizontal Scroll */}
          <div
            className={
              isCollectionsSticky
                ? 'flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory'
                : `grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-7 gap-2'}`
            }
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SHOPIFY_COLLECTIONS.map((collection) => {
              const isActive = activeCollection === collection.handle;
              return (
                <button
                  key={collection.handle}
                  onClick={() => handleCollectionChange(collection.handle)}
                  className={`
                    px-4 py-3 text-center border transition-all rounded-lg relative
                    ${isActive
                      ? `${collection.colors.bgActive} ${collection.colors.textActive} ${collection.colors.borderActive} shadow-lg ${isCollectionsSticky ? '' : 'scale-105'}`
                      : `${collection.colors.bg} ${collection.colors.text} ${collection.colors.border} hover:scale-102`
                    }
                    ${isMobile ? 'text-xs' : 'text-sm'}
                    ${isCollectionsSticky ? 'flex-shrink-0 snap-start whitespace-nowrap' : ''}
                    tracking-[0.1em] font-medium
                  `}
                  disabled={loading && activeCollection !== collection.handle}
                >
                  {collection.label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <QuickOrderSearch />
        </div>
      </div>

      {/* Product Grid */}
      <main className="px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load products. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <QuickOrderGrid products={products} loading={loading} />
          )}
        </div>
      </main>

      {/* Cart Summary Bar - Fixed Bottom */}
      <CartSummaryBar />
    </div>
  );
}
