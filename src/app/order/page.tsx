/**
 * @fileoverview Quick Order page - streamlined product ordering with site navigation
 * @module app/quick-order/page
 */

'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';
import QuickOrderFAQs from '@/components/quick-order/QuickOrderFAQs';
import DeliveryAreasPreview from '@/components/quick-order/DeliveryAreasPreview';
import { SHOPIFY_COLLECTIONS } from '@/lib/products/categories';
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
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Nav hide/show on scroll direction
  const [hideNav, setHideNav] = useState(false);
  const lastScrollY = useRef(0);

  // Search overlay state
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Intersection Observer for sticky detection - more robust than scroll events
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel exits viewport (scrolled past), make collections sticky
        setIsCollectionsSticky(!entry.isIntersecting);
      },
      {
        rootMargin: '-96px 0px 0px 0px', // Account for nav height (h-24 = 96px)
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Hide nav on scroll down, show on scroll up (only when collections are sticky)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY.current;

          // Hide nav: scroll down > 30px while collections sticky
          // Show nav: any scroll up > 5px
          if (scrollDelta > 30 && isCollectionsSticky) {
            setHideNav(true);
            lastScrollY.current = currentScrollY;
          } else if (scrollDelta < -5) {
            setHideNav(false);
            lastScrollY.current = currentScrollY;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCollectionsSticky]);

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
      <OldFashionedNavigation
        forceScrolled={!isMobile}
        hidden={hideNav}
        hideMobileLogo
        forceWhiteHamburger
      />

      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[40vh] mt-28 md:mt-24 flex items-center justify-center overflow-hidden">
        <Image
          src="/images/order/order-hero.png"
          alt="Premium Bar Setup at Austin Pool Party"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

        <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-6">
          <h1 className="font-heading font-light text-5xl md:text-7xl mb-6 tracking-[0.15em] leading-tight md:leading-tight">
            <span className="block text-white mb-2">Your Bar,</span>
            <span className="block text-brand-yellow italic">DELIVERED</span>
          </h1>
          <div className="w-24 h-px bg-brand-yellow mx-auto mb-6" />
          <p className="text-lg md:text-xl font-light tracking-[0.1em] text-gray-200">
            Tap. Add. Party On.
          </p>
        </div>
      </section>

      {/* Sentinel for sticky detection - IntersectionObserver watches this */}
      <div ref={sentinelRef} className="h-0" aria-hidden="true" />

      {/* Featured Collections - Sticky */}
      <section
        ref={collectionsRef}
        className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ${
          isCollectionsSticky
            ? `sticky z-40 py-3 shadow-md ${hideNav ? 'top-0' : 'top-24'}`
            : 'py-6'
        }`}
      >
        <div className={isMobile ? 'px-4' : 'max-w-7xl mx-auto px-8'}>
          {/* Header - hide when sticky */}
          {!isCollectionsSticky && (
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-heading ${isMobile ? 'text-lg' : 'text-xl'} text-gray-900 tracking-[0.1em]`}>
                FEATURED COLLECTIONS
              </h3>
              {activeCollection !== 'favorites-home-page' && (
                <button
                  onClick={clearCollection}
                  className="text-sm text-brand-yellow hover:text-yellow-600 tracking-[0.1em]"
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
                ? 'flex items-center gap-2'
                : `grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-7 gap-2'}`
            }
          >
            {/* Search button - only show when sticky */}
            {isCollectionsSticky && (
              <button
                onClick={() => setShowSearchOverlay(true)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                aria-label="Search products"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Categories */}
            <div
              className={
                isCollectionsSticky
                  ? 'flex overflow-x-auto gap-2 pb-2 -mr-4 pr-4 scrollbar-hide snap-x snap-mandatory flex-1'
                  : 'contents'
              }
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {SHOPIFY_COLLECTIONS.map((collection) => {
                if (!collection?.colors) return null;
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
        </div>
      </section>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <QuickOrderSearch />
        </div>
      </div>

      {/* Product Grid */}
      <main className="px-4 py-6">
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

      {/* SEO Sections */}
      <DeliveryAreasPreview />
      <QuickOrderFAQs />

      {/* Footer */}
      <div className="pb-20">
        <Footer />
      </div>

      {/* Cart Summary Bar - Fixed Bottom */}
      <CartSummaryBar />

      {/* Search Overlay */}
      {showSearchOverlay && (
        <div
          className="fixed inset-0 z-50 bg-black/50 px-4 pt-4"
          onClick={() => setShowSearchOverlay(false)}
        >
          <div
            className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search header with close button */}
            <div className="p-4 flex items-start gap-3">
              <div className="flex-1 relative">
                <QuickOrderSearch autoFocus onResultClick={() => setShowSearchOverlay(false)} />
              </div>
              <button
                onClick={() => setShowSearchOverlay(false)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 -mt-1"
                aria-label="Close search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
