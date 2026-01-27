'use client';

import { useState, useEffect, useRef, Suspense, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import JoinOrderModal from '@/components/partners/JoinOrderModal';
import DrinkCalculator from '@/components/partners/DrinkCalculator';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import PremierHero from '@/components/partners/PremierHero';
import PremierHeroStickyCTA from '@/components/partners/PremierHeroStickyCTA';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import { SHOPIFY_COLLECTIONS } from '@/lib/shopify/categories';
import type { ShopifyProduct } from '@/lib/shopify/types';

/** Real Google reviews for boat parties */
const TESTIMONIALS = [
  {
    reviewer: 'Kirby Parsons',
    text: 'Must do if going on premier disco cruise in ATX!!! So easy, didn\'t have to bring anything with us and it was all set up by the time we even arrived. Needed no communication with company on day of they just know what they\'re doing!',
  },
  {
    reviewer: 'Chop Choplin',
    text: 'Working with Party on Delivery for our 50 person boat party was a massive game changer. They had everything we could possibly need to order and communication was on point! Having everything delivered to the boat, drinks iced, and ready to go when we got there was such a pleasure.',
  },
  {
    reviewer: 'Casey Ancar',
    text: 'I booked Premier Party for my 30th birthday and it was a blast! My party of 14 booked The 25 ppl boat to have more space. The Party On delivery service was soooo convenient. They delivered my drink order straight to the boat along with ice and cups.',
  },
  {
    reviewer: 'Nikita Patel',
    text: 'We picked them for delivery when we did the ATX Party Boats. We got on board, our drinks were in a cooler with our name on it, on ice. My group and I did not have to worry about lugging anything to the boat in the Texan heat.',
  },
];

/** Perks for spending $250+ on group boat order */
const SPECIAL_PERKS = [
  { title: 'FREE Delivery to marina', value: '$50 value' },
  { title: 'FREE Cooler Stocking', value: '$30 value' },
  { title: 'FREE Bag of Ice', value: '$10 value' },
  { title: 'FREE Welcome Package', value: '$40+ value' },
];

/**
 * Premier Party Cruises - Drink Delivery Service Landing Page
 * Optimized for customers who have already booked their boat
 */
function PremierPartyCruisesPageContent(): ReactElement {
  const searchParams = useSearchParams();
  // Search params available for future use
  void searchParams;

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState('favorites-home-page');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Sticky collections state
  const [isCollectionsSticky, setIsCollectionsSticky] = useState(false);
  const collectionsRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);
  const [isPastProductSection, setIsPastProductSection] = useState(false);

  // Load products for active collection
  const { products, loading, error } = useQuickOrderProducts(activeCollection);

  // Welcome packages for Special Perks section
  const [welcomePackages, setWelcomePackages] = useState<ShopifyProduct[]>([]);
  const [welcomeLoading, setWelcomeLoading] = useState(true);

  // Fetch welcome packages from collection on mount
  useEffect(() => {
    async function fetchWelcomePackages() {
      try {
        // Try collection first, fall back to search
        let response = await fetch('/api/products?collection=welcome-to-austin-packages&first=10');
        let data = await response.json();

        // If collection is empty, try search as fallback
        if (!data.products?.length && !data.products?.edges?.length) {
          response = await fetch('/api/products?search=Welcome%20to%20Austin&first=20');
          data = await response.json();

          // Filter for Welcome Package products
          if (data.products) {
            const filtered = (data.products.edges || data.products).filter(
              (item: { node?: ShopifyProduct } | ShopifyProduct) => {
                const p = 'node' in item ? item.node : item;
                return p.productType === 'Welcome Package' ||
                       p.title?.startsWith('Welcome to Austin:');
              }
            ).map((item: { node?: ShopifyProduct } | ShopifyProduct) =>
              'node' in item ? item.node : item
            );
            setWelcomePackages(filtered);
            return;
          }
        }

        // Handle collection response
        if (data.products?.edges) {
          setWelcomePackages(data.products.edges.map((e: { node: ShopifyProduct }) => e.node));
        } else if (data.products) {
          setWelcomePackages(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch welcome packages:', err);
      } finally {
        setWelcomeLoading(false);
      }
    }
    fetchWelcomePackages();
  }, []);

  // Intersection Observer for sticky detection (start and end of product section)
  useEffect(() => {
    if (!sentinelRef.current) return;

    const startObserver = new IntersectionObserver(
      ([entry]) => {
        setIsCollectionsSticky(!entry.isIntersecting);
      },
      {
        rootMargin: '-96px 0px 0px 0px',
        threshold: 0,
      }
    );

    startObserver.observe(sentinelRef.current);
    return () => startObserver.disconnect();
  }, []);

  // Detect when user scrolls past the product section
  useEffect(() => {
    if (!endSentinelRef.current) return;

    const endObserver = new IntersectionObserver(
      ([entry]) => {
        // When end sentinel enters viewport from above, we're past the product section
        setIsPastProductSection(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      {
        rootMargin: '0px 0px 0px 0px',
        threshold: 0,
      }
    );

    endObserver.observe(endSentinelRef.current);
    return () => endObserver.disconnect();
  }, []);

  const scrollToCollections = () => {
    document.getElementById('boat-collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCollectionChange = (handle: string) => {
    if (activeCollection === handle) return;
    setActiveCollection(handle);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation - Always hidden on this partner page */}
      <OldFashionedNavigation hidden />

      {/* HERO SECTION - A/B variant via ?hero=center */}
      <PremierHero />

      {/* VIDEO + WHAT'S INCLUDED SECTION */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">
              See the Experience
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
              What a Boat Day Looks Like
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Video Container - Takes 3 columns on desktop */}
            <div className="lg:col-span-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-gray-900">
                <iframe
                  src="https://www.youtube.com/embed/4-Yx24Y6oro?rel=0&modestbranding=1"
                  title="Premier Party Cruises boat party experience"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-center text-gray-500 text-sm mt-4">
                Your drinks delivered, iced, and waiting when you arrive at the marina
              </p>
            </div>

            {/* What's Included - Takes 2 columns on desktop */}
            <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-lg">
              <p className="text-gray-500 tracking-[0.2em] uppercase text-base mb-2 text-center">
                Boat Day = Handled
              </p>
              <h3 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide mb-6 text-center">
                Every Order Includes
              </h3>
              <div className="space-y-4">
                {[
                  { item: 'FREE delivery to Premier Party Cruises marina', value: '$50' },
                  { item: 'Cooler stocking with ice', value: '$25' },
                  { item: 'Group ordering with split payments', value: 'FREE' },
                  { item: 'Private reserved cooler on Disco Cruise', value: 'FREE' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                  >
                    <span className="flex items-center gap-3 text-gray-900 text-base">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {row.item}
                    </span>
                    <span className="text-gray-900 font-semibold text-base">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-300 flex justify-between items-center">
                <span className="font-serif text-lg text-gray-900">Total Value</span>
                <span className="font-serif text-xl text-gray-900 font-semibold">$75+ FREE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} id="boat-collections" className="h-0" aria-hidden="true" />

      {/* Featured Collections - Sticky only in product section */}
      <section
        ref={collectionsRef}
        className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ${
          isCollectionsSticky && !isPastProductSection
            ? 'sticky z-40 py-2 shadow-md top-0'
            : 'py-6'
        }`}
      >
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-8">
          {/* CTA Buttons - hide when sticky */}
          {!isCollectionsSticky && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Individual Order Button */}
              <button
                onClick={scrollToCollections}
                className="group flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-semibold tracking-wide transition-all rounded-xl shadow-sm hover:shadow-md"
              >
                <span>Scroll Down to Add Products</span>
                <svg
                  className="w-5 h-5 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Group Order Button */}
              <Link
                href="/orders/create"
                className="flex items-center justify-center gap-3 py-4 px-6 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wide transition-all rounded-xl shadow-sm hover:shadow-md"
              >
                <span>Start a Group Order</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
            </div>
          )}

          {/* Collections Grid/Horizontal Scroll */}
          <div
            className={
              isCollectionsSticky
                ? 'flex items-center gap-2'
                : 'grid grid-cols-2 md:grid-cols-7 gap-2'
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
                const isActive = activeCollection === collection.handle;
                return (
                  <button
                    key={collection.handle}
                    onClick={() => handleCollectionChange(collection.handle)}
                    className={`
                      text-center border transition-all rounded-lg relative
                      ${isCollectionsSticky ? 'px-3 py-2' : 'px-4 py-3'}
                      ${isActive
                        ? `${collection.colors.bgActive} ${collection.colors.textActive} ${collection.colors.borderActive} shadow-lg ${isCollectionsSticky ? '' : 'scale-105'}`
                        : `${collection.colors.bg} ${collection.colors.text} ${collection.colors.border} hover:scale-102`
                      }
                      text-xs md:text-sm
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
      <main className="px-4 py-8">
        <div id="product-grid" className="scroll-mt-24 max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load products. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-gold-600 text-gray-900 rounded-lg hover:bg-gold-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <QuickOrderGrid products={products} loading={loading} />
          )}
        </div>
      </main>

      {/* End sentinel for product section */}
      <div ref={endSentinelRef} className="h-0" aria-hidden="true" />

      {/* DRINK CALCULATOR */}
      <div id="order-builder" className="scroll-mt-24">
        <DrinkCalculator />
      </div>

      {/* SPECIAL PERKS SECTION */}
      <section className="relative py-20 px-6 md:px-12 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/partners/premierpartycruises-testimonials-bg.jpg"
          alt="Premier Party Cruises team"
          fill
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gray-900/70" />

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-5xl text-white tracking-wide mb-4">
              Special Perks for Premier Customers
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Spend $250 on your group boat order and unlock exclusive perks
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Value Stack Tile */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h3 className="font-serif text-xl text-white mb-6">What You Get</h3>
              <div className="space-y-4">
                {SPECIAL_PERKS.map((perk) => (
                  <div
                    key={perk.title}
                    className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                  >
                    <span className="flex items-center gap-3 text-white">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {perk.title}
                    </span>
                    <span className="text-gold-400 font-semibold">{perk.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                <span className="text-white font-serif text-lg">Total Value</span>
                <span className="text-gold-400 font-bold text-2xl">$130+ FREE</span>
              </div>
            </div>

            {/* RIGHT: Welcome Package Carousel Tile */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <h3 className="font-serif text-xl text-white mb-6">Choose Your FREE Welcome Package</h3>
              {welcomeLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-48 h-48 bg-gray-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : welcomePackages.length > 0 ? (
                <div
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {welcomePackages.map((pkg) => {
                    const imageUrl = pkg.images?.edges?.[0]?.node?.url || pkg.featuredImage?.url;
                    const packageName = pkg.title.includes(':')
                      ? pkg.title.split(':')[1].trim()
                      : pkg.title;
                    return (
                      <div
                        key={pkg.id}
                        className="flex-shrink-0 w-48 snap-start group cursor-pointer"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={pkg.title}
                              fill
                              sizes="192px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          {/* Name overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-sm font-medium text-center line-clamp-2">
                              {packageName}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Welcome packages coming soon!</p>
              )}
              <p className="text-gray-400 text-sm text-center mt-4">
                Swipe to browse • Added FREE at checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-16 px-6 md:px-12 bg-gray-800 overflow-hidden">
        {/* Background Image - TODO: Add new testimonials background image */}
        {/* <Image src="/images/partners/premierpartycruises-testimonials-bg.jpg" alt="Boat party" fill className="object-cover" /> */}
        {/* <div className="absolute inset-0 bg-gray-900/30" /> */}

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold-400 tracking-[0.2em] uppercase text-sm mb-3">
              Real Reviews
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide">
              What Boat Party Hosts Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {TESTIMONIALS.map((review, idx) => (
              <div key={idx} className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-200 mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
                <p className="font-medium text-white">— {review.reviewer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-16 px-6 md:px-12 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide mb-8 text-center">
            Austin-Born. Fully Licensed. Always On Time.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-white mb-2">On-Time Guarantee</h3>
              <p className="text-gray-400 text-sm">Your order arrives before your boarding time, or delivery is FREE.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-white mb-2">Licensed & Insured</h3>
              <p className="text-gray-400 text-sm">Fully TABC-certified with liability coverage. Everything by the book.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-white mb-2">Order Accuracy</h3>
              <p className="text-gray-400 text-sm">Every item checked before delivery. If something&apos;s wrong, we make it right immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            Ready for the Lake?
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Get your drinks delivered before you board. Free delivery. Easy group ordering. Zero hassle.
          </p>

          <div className="flex flex-col items-center gap-3 mb-6">
            {/* PRIMARY CTA */}
            <Link
              href="/orders/create"
              className="px-10 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold tracking-wider transition-colors rounded-lg"
            >
              Start a Group Order
            </Link>

            {/* SECONDARY */}
            <button
              onClick={scrollToCollections}
              className="text-gray-800 hover:text-gray-900 font-medium tracking-wider underline underline-offset-4"
            >
              or start an individual order
            </button>

            {/* TERTIARY */}
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="text-gray-700 hover:text-gray-900 text-sm tracking-wider"
            >
              Have a share code? Join an order
            </button>
          </div>

          <p className="text-gray-700">
            Questions? Call us:{' '}
            <a href="tel:7373719700" className="font-semibold underline">
              737.371.9700
            </a>
          </p>
        </div>
      </section>

      {/* FOOTER - with padding for CartSummaryBar and mobile sticky CTA */}
      <div className="pb-24 md:pb-20">
        <Footer />
      </div>

      {/* Cart Summary Bar - Fixed Bottom */}
      <CartSummaryBar />

      {/* Mobile Sticky CTA - only visible on mobile */}
      <PremierHeroStickyCTA onJoinCode={() => setIsJoinModalOpen(true)} />

      {/* MODALS */}
      <JoinOrderModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

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

/**
 * Page wrapper with Suspense boundary for useSearchParams
 * Required by Next.js 15 for client components using search params
 */
export default function PremierPartyCruisesPage(): ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PremierPartyCruisesPageContent />
    </Suspense>
  );
}
