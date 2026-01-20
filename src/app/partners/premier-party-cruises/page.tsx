'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import PartnerHeroVideo from '@/components/partners/PartnerHeroVideo';
import JoinOrderModal from '@/components/partners/JoinOrderModal';
import DrinkCalculator from '@/components/partners/DrinkCalculator';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import WelcomePackageGrid from '@/components/partners/WelcomePackageGrid';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SHOPIFY_COLLECTIONS } from '@/lib/shopify/categories';

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

/**
 * Premier Party Cruises - Drink Delivery Service Landing Page
 * Optimized for customers who have already booked their boat
 */
export default function PremierPartyCruisesPage(): ReactElement {
  const [navHidden, setNavHidden] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState('favorites-home-page');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  // Sticky collections state
  const [isCollectionsSticky, setIsCollectionsSticky] = useState(false);
  const collectionsRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Nav hide/show on scroll direction (when in ordering section)
  const [hideNavOnScroll, setHideNavOnScroll] = useState(false);
  const lastScrollY = useRef(0);

  // Load products for active collection
  const { products, loading, error } = useQuickOrderProducts(activeCollection);

  // Scroll-triggered navigation reveal (hero observer)
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNavHidden(entry.intersectionRatio > 0.5);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for sticky detection
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollectionsSticky(!entry.isIntersecting);
      },
      {
        rootMargin: '-96px 0px 0px 0px',
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

          if (scrollDelta > 30 && isCollectionsSticky) {
            setHideNavOnScroll(true);
            lastScrollY.current = currentScrollY;
          } else if (scrollDelta < -5) {
            setHideNavOnScroll(false);
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

  const scrollToCollections = () => {
    document.getElementById('boat-collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCollectionChange = (handle: string) => {
    if (activeCollection === handle) return;
    setActiveCollection(handle);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation - Hidden initially, reveals on scroll, hides when scrolling down in order section */}
      <OldFashionedNavigation
        hidden={navHidden || hideNavOnScroll}
        forceWhiteHamburger={navHidden}
        hideMobileLogo
      />

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden"
      >
        <PartnerHeroVideo
          videoId="4-Yx24Y6oro"
          fallbackImage="/images/partners/premierpartycruises-hero.webp"
          alt="Premier Party Cruises boat party on Lake Travis"
        />

        {/* Hero Content - Two Column Layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Logo & Headline */}
            <div>
              <Image
                src="/images/partners/premierpartycruises-logo.webp"
                alt="Premier Party Cruises"
                width={200}
                height={100}
                className="h-16 md:h-20 w-auto mb-6 brightness-0 invert"
                priority
              />
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-wide leading-tight">
                Drink Delivery Service for Premier Party Cruises
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-4 leading-relaxed">
                Cold drinks waiting at your boat—no liquor store, no heavy lifting.
              </p>
              <p className="text-gray-300 text-sm md:text-base">
                Free delivery to the marina. Easy group ordering.
              </p>
            </div>

            {/* Right Column - CTAs */}
            <div className="flex flex-col items-start md:items-center space-y-4">
              <button
                onClick={scrollToCollections}
                className="w-full md:w-80 py-4 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wider transition-colors text-center"
              >
                START AN INDIVIDUAL ORDER
              </button>
              <Link
                href=""
                className="w-full md:w-80 py-4 border-2 border-white/80 text-white hover:bg-white/10 font-semibold tracking-wider transition-colors text-center block"
              >
                START A GROUP ORDER
              </Link>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="text-gold-400 hover:text-gold-300 font-medium tracking-wider underline underline-offset-4"
              >
                Join an Existing Order
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center gap-4 md:gap-8 text-white/80 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free Marina Delivery
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              500+ Boat Parties
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              TABC Licensed
            </span>
          </div>
        </div>
      </section>

      {/* QUICK VALUE ROW */}
      <section className="bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <span className="text-sm md:text-base">Free Marina Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
              </svg>
              <span className="text-sm md:text-base">Coolers Stocked with Ice</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm md:text-base">500+ Boat Parties Served</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span className="text-sm md:text-base">Easy Group Ordering</span>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME TO AUSTIN PACKAGES - Free for Premier Party Cruises customers */}
      <section className="py-12 px-6 md:px-12 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gold-400 tracking-[0.2em] uppercase text-sm mb-2">
              Exclusive for Premier Party Cruises
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide mb-4">
              Welcome to Austin Packages
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-4">
              Delivered to your Airbnb before or after your cruise. Add a package to your cart and use code{' '}
              <span className="inline-block font-mono bg-gold-500/20 text-gold-400 px-3 py-1 rounded mx-1">
                PREMIERPARTYCRUISES
              </span>{' '}
              at checkout for 100% off.
            </p>
            <p className="text-gray-400 text-sm">
              Perfect for pre-cruise pregaming or post-cruise afterparties at your rental
            </p>
          </div>
          <WelcomePackageGrid />
        </div>
      </section>

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} id="boat-collections" className="h-0" aria-hidden="true" />

      {/* Featured Collections - Sticky (matches /order page exactly) */}
      <section
        ref={collectionsRef}
        className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ${
          isCollectionsSticky
            ? `sticky z-40 py-3 shadow-md ${hideNavOnScroll ? 'top-0' : 'top-24'}`
            : 'py-6'
        }`}
      >
        <div className={isMobile ? 'px-4' : 'max-w-7xl mx-auto px-8'}>
          {/* Header - hide when sticky */}
          {!isCollectionsSticky && (
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-serif ${isMobile ? 'text-lg' : 'text-xl'} text-gray-900 tracking-[0.1em]`}>
                BOAT DAY ESSENTIALS
              </h3>
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

      {/* VALUE STACK + GUARANTEES - Side by side on desktop */}
      <section className="py-16 px-6 md:px-12 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* What's Included */}
            <div className="bg-white rounded-xl p-6 md:p-8">
              <p className="text-gold-600 tracking-[0.2em] uppercase text-sm mb-2">
                Everything Handled
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide mb-6">
                What&apos;s Included
              </h2>
              <div className="space-y-3">
                {[
                  { item: 'Free delivery to Premier Party Cruises marina', value: '$50' },
                  { item: 'Cooler stocking with ice', value: '$25' },
                  { item: 'Ice included with every order', value: '$15' },
                  { item: 'Group ordering with split payments', value: 'Convenience' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                  >
                    <span className="flex items-center gap-2 text-gray-900 text-sm md:text-base">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {row.item}
                    </span>
                    <span className="text-gold-600 font-medium text-sm md:text-base">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
                <span className="font-serif text-lg text-gray-900">Total Value</span>
                <span className="font-serif text-xl text-gold-600">$90+ FREE</span>
              </div>
            </div>

            {/* Our Promise */}
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide mb-6">
                Our Promise to You
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white mb-1">On-Time Guarantee</h3>
                    <p className="text-gray-400 text-sm">Your order arrives before your boarding time, or delivery is free.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white mb-1">Licensed & Insured</h3>
                    <p className="text-gray-400 text-sm">Fully TABC-certified with liability coverage. Everything by the book.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white mb-1">Order Accuracy</h3>
                    <p className="text-gray-400 text-sm">Every item checked before delivery. If something&apos;s wrong, we make it right immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DRINK CALCULATOR */}
      <DrinkCalculator />

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold-600 tracking-[0.2em] uppercase text-sm mb-3">
              Real Reviews
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-wide">
              What Boat Party Hosts Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((review, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
                <p className="font-medium text-gray-900">— {review.reviewer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            Ready for the Lake?
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Get your drinks delivered before you board. Free delivery. Easy group ordering. Zero hassle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={scrollToCollections}
              className="px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold tracking-wider transition-colors"
            >
              Start Your Order
            </button>
            <Link
              href=""
              className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-semibold tracking-wider transition-colors"
            >
              Start a Group Order
            </Link>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-8 py-4 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold tracking-wider transition-colors"
            >
              Join an Order
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

      {/* FOOTER - with padding for CartSummaryBar */}
      <div className="pb-20">
        <Footer />
      </div>

      {/* Cart Summary Bar - Fixed Bottom */}
      <CartSummaryBar />

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
