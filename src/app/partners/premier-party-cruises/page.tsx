'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import JoinOrderModal from '@/components/partners/JoinOrderModal';
import DrinkCalculator from '@/components/partners/DrinkCalculator';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import WelcomePackageCard from '@/components/partners/WelcomePackageCard';
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

/** Perks for spending $250+ on group Airbnb order */
const SPECIAL_PERKS = [
  {
    title: 'Free Delivery',
    description: 'To your Airbnb',
    value: '$50 value',
    icon: (
      <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: 'Free Cooler Stocking',
    description: 'We stock your coolers',
    value: '$30 value',
    icon: (
      <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: 'Free Bag of Ice',
    description: 'Keep drinks cold',
    value: '$10 value',
    icon: (
      <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Free Welcome Package',
    description: 'Austin-themed goodies',
    value: '$40+ value',
    icon: (
      <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
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

  // Sticky collections state
  const [isCollectionsSticky, setIsCollectionsSticky] = useState(false);
  const collectionsRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Nav hide/show on scroll direction (when in ordering section)
  const [hideNavOnScroll, setHideNavOnScroll] = useState(false);
  const lastScrollY = useRef(0);

  // Load products for active collection
  const { products, loading, error } = useQuickOrderProducts(activeCollection);

  // Welcome packages for Special Perks section
  const [welcomePackages, setWelcomePackages] = useState<ShopifyProduct[]>([]);
  const [welcomeLoading, setWelcomeLoading] = useState(true);

  // Fetch welcome packages on mount
  useEffect(() => {
    async function fetchWelcomePackages() {
      try {
        const response = await fetch('/api/products?search=Welcome%20to%20Austin&first=10');
        const data = await response.json();
        if (data.products) {
          // Filter for Welcome Package products
          const packages = data.products.filter(
            (p: ShopifyProduct) =>
              p.productType === 'Welcome Package' ||
              p.title.startsWith('Welcome to Austin:')
          );
          setWelcomePackages(packages);
        }
      } catch (err) {
        console.error('Failed to fetch welcome packages:', err);
      } finally {
        setWelcomeLoading(false);
      }
    }
    fetchWelcomePackages();
  }, []);

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
        className="relative min-h-[100vh] md:min-h-[70vh] pt-28 pb-8 md:pt-0 flex items-center overflow-hidden"
      >
        {/* Static Image Background */}
        <Image
          src="/images/partners/premierpartycruises-hero.webp"
          alt="Premier Party Cruises boat party on Lake Travis"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40" />

        {/* Hero Content - Two Column Layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Headline & Logos */}
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-wide leading-tight">
                Your Drinks, Iced & Waiting When You Board
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
                Skip the liquor store. We deliver to the marina before you arrive.
              </p>
              {/* Partner Logos */}
              <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                <Image
                  src="/images/partners/premierpartycruises-logo.webp"
                  alt="Premier Party Cruises"
                  width={200}
                  height={100}
                  className="h-12 md:h-16 w-auto"
                  priority
                />
                <span className="text-white/60 text-2xl font-light">+</span>
                <Image
                  src="/images/pod-logo-2025.svg"
                  alt="Party On Delivery"
                  width={160}
                  height={80}
                  className="h-10 md:h-14 w-auto"
                  priority
                />
              </div>
            </div>

            {/* Right Column - CTAs */}
            <div className="flex flex-col items-center space-y-3">
              {/* PRIMARY CTA - Group Order (most common for boat parties) */}
              <Link
                href=""
                className="w-full md:w-80 py-4 px-8 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wider transition-colors text-center block rounded-lg"
              >
                START A GROUP ORDER
              </Link>

              {/* Friction reducer - moved directly below CTA */}
              <p className="text-gray-400 text-xs">
                Takes 2 minutes · No account required · Free delivery
              </p>

              {/* SECONDARY - Individual Order (text link) */}
              <button
                onClick={scrollToCollections}
                className="text-white hover:text-gold-300 font-medium tracking-wider underline underline-offset-4"
              >
                or start an individual order
              </button>

              {/* TERTIARY - Join Order */}
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="text-gray-400 hover:text-white text-sm tracking-wider underline underline-offset-4"
              >
                Have a share code? Join an order
              </button>

              {/* Phone number for users who prefer to call or text */}
              <p className="text-gray-300 text-sm mt-2">
                Questions? Call or text{' '}
                <a href="tel:7373719700" className="text-gold-400 hover:text-gold-300 underline">
                  737.371.9700
                </a>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-white/80 text-sm">
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
              Easy Group Ordering
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              500+ Boat Parties Served
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              TABC Licensed
            </span>
          </div>

          {/* Social Proof Snippet */}
          <div className="mt-6 flex items-center justify-center md:justify-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 max-w-xl mx-auto md:mx-0">
            <div className="flex -space-x-1 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/90 text-sm italic">
              &quot;Must do if going on Premier cruise in ATX! So easy, everything was set up by the time we arrived.&quot;
              <span className="text-white/60 not-italic ml-2">— Kirby P.</span>
            </p>
          </div>
        </div>
      </section>

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
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg">
              <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-2">
                Everything Handled
              </p>
              <h3 className="font-serif text-xl md:text-2xl text-gray-900 tracking-wide mb-4">
                What&apos;s Included
              </h3>
              <div className="space-y-3">
                {[
                  { item: 'Free delivery to Premier Party Cruises marina', value: '$50' },
                  { item: 'Cooler stocking with ice', value: '$25' },
                  { item: 'Ice included with every order', value: '$15' },
                  { item: 'Group ordering with split payments', value: 'Free' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                  >
                    <span className="flex items-center gap-2 text-gray-900 text-sm">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {row.item}
                    </span>
                    <span className="text-gray-900 font-semibold text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
                <span className="font-serif text-base text-gray-900">Total Value</span>
                <span className="font-serif text-lg text-gray-900 font-semibold">$90+ FREE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIAL PERKS SECTION */}
      <section className="relative py-20 px-6 md:px-12 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-600 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-gold-400 tracking-[0.2em] uppercase text-sm mb-3">
              Exclusive for Premier Customers
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-white tracking-wide mb-4">
              Special Perks for Premier Customers
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Spend $250 on your group Airbnb order and unlock these exclusive perks
            </p>
          </div>

          {/* Value Stack - 4 Perks Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {SPECIAL_PERKS.map((perk) => (
              <div
                key={perk.title}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gold-500/20 rounded-full flex items-center justify-center">
                  {perk.icon}
                </div>
                <h3 className="text-white font-semibold mb-1">{perk.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{perk.description}</p>
                <p className="text-gold-400 font-medium">{perk.value}</p>
              </div>
            ))}
          </div>

          {/* Welcome Package Carousel */}
          <div className="mb-10">
            <h3 className="text-white text-xl font-serif mb-6 text-center">
              Choose Your Free Welcome Package
            </h3>
            {welcomeLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-72 h-80 bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : welcomePackages.length > 0 ? (
              <div
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {welcomePackages.map((pkg) => (
                  <div key={pkg.id} className="flex-shrink-0 w-72 snap-start">
                    <WelcomePackageCard product={pkg} discountCode="PREMIERPARTYCRUISES" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">Welcome packages coming soon!</p>
            )}
          </div>

          {/* Total Value Summary */}
          <div className="text-center">
            <p className="text-white text-lg">
              Total Value: <span className="text-gold-400 font-bold text-2xl">$130+</span> in free perks
            </p>
          </div>
        </div>
      </section>

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} id="boat-collections" className="h-0" aria-hidden="true" />

      {/* Featured Collections - Sticky (matches /order page exactly) */}
      <section
        ref={collectionsRef}
        className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ${
          isCollectionsSticky
            ? `sticky z-40 py-2 shadow-md ${hideNavOnScroll ? 'top-0' : 'top-24'}`
            : 'py-6'
        }`}
      >
        <div className="px-4 md:max-w-7xl md:mx-auto md:px-8">
          {/* Header - hide when sticky */}
          {!isCollectionsSticky && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg md:text-xl text-gray-900 tracking-[0.1em]">
                BOAT DAY ESSENTIALS
              </h3>
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

      {/* OUR PROMISE SECTION */}
      <section className="py-16 px-6 md:px-12 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide mb-8 text-center">
            Our Promise to You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-gold-500/20 text-gold-400 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-white mb-2">On-Time Guarantee</h3>
              <p className="text-gray-400 text-sm">Your order arrives before your boarding time, or delivery is free.</p>
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

      {/* DRINK CALCULATOR */}
      <DrinkCalculator />

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gray-500 tracking-[0.2em] uppercase text-sm mb-3">
              Real Reviews
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-wide">
              What Boat Party Hosts Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
              href=""
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
