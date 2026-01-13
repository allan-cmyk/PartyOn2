'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import VenueFilters from '@/components/byob-venues/VenueFilters';
import VenueGrid from '@/components/byob-venues/VenueGrid';
import HeroMosaicGrid from '@/components/byob-venues/HeroMosaicGrid';
import venuesData from '@/data/byob-venues.json';
import type { BYOBVenue, VenueCategory, EventType } from '@/lib/byob-venues/types';

export default function AustinBYOBVenuesPage() {
  const [activeCategory, setActiveCategory] = useState<VenueCategory | 'all'>('all');
  const [activeEventType, setActiveEventType] = useState<EventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPartnersOnly, setShowPartnersOnly] = useState(false);

  // Mobile scroll-to-hide state
  const [hideHeaderOnMobile, setHideHeaderOnMobile] = useState(false);
  const venueGridRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Detect scroll direction and position to hide/show header on mobile
  useEffect(() => {
    const handleScroll = () => {
      // Only apply on mobile (< 768px)
      if (window.innerWidth >= 768) {
        setHideHeaderOnMobile(false);
        return;
      }

      const currentScrollY = window.scrollY;
      const venueGridTop = venueGridRef.current?.getBoundingClientRect().top ?? 0;
      const viewportHeight = window.innerHeight;

      // Hide header when scrolling down AND venue grid is near/past the top of viewport
      // Show header when scrolling up OR at the very top of the page
      if (currentScrollY < 100) {
        // Near top of page - always show header
        setHideHeaderOnMobile(false);
      } else if (venueGridTop < viewportHeight * 0.5) {
        // Venue grid is in view - hide header when scrolling down
        if (currentScrollY > lastScrollY.current) {
          setHideHeaderOnMobile(true);
        } else if (currentScrollY < lastScrollY.current - 50) {
          // Scrolling up significantly - show header
          setHideHeaderOnMobile(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const venues = venuesData.venues as BYOBVenue[];

  // Calculate venue counts per category
  const venueCounts = useMemo(() => {
    const counts: Record<VenueCategory | 'all', number> = {
      all: venues.length,
      'historic-cultural': 0,
      'gardens-outdoor': 0,
      'barns-ranches': 0,
      'modern-industrial': 0,
      'public-community': 0,
      'entertainment': 0,
      'hill-country': 0,
    };

    venues.forEach((venue) => {
      if (counts[venue.category] !== undefined) {
        counts[venue.category]++;
      }
    });

    return counts;
  }, [venues]);

  // Get partner venues for spotlight
  const partnerVenues = useMemo(() => {
    return venues
      .filter((v) => v.partnerStatus !== 'none')
      .sort((a, b) => {
        const tierOrder = { premier: 0, featured: 1, listed: 2, none: 3 };
        return tierOrder[a.partnerStatus] - tierOrder[b.partnerStatus];
      });
  }, [venues]);

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation hidden={hideHeaderOnMobile} />

      {/* Hero Section with Dynamic Mosaic Grid */}
      <section className="relative h-[50vh] min-h-[400px] mt-24 flex items-center">
        {/* Mosaic grid with staggered image transitions */}
        <HeroMosaicGrid />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-white">
          <ScrollRevealCSS duration={800} y={30}>
            <p className="text-gold-400 tracking-[0.2em] uppercase text-sm mb-4">
              Austin Venue Directory
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-6 tracking-[0.1em] max-w-4xl">
              Austin BYOB Venues
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl leading-relaxed text-gray-200 mb-8">
              Discover {venues.length} Austin venues that allow outside alcohol. Perfect for
              weddings, corporate events, and celebrations. Partner venues get free delivery.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gold-400 rounded-full" />
                <span>{venues.length} BYOB Venues</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gold-400 rounded-full" />
                <span>{partnerVenues.length} Partner Venues</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gold-400 rounded-full" />
                <span>Free Delivery Available</span>
              </div>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Partner Spotlight Section */}
      {partnerVenues.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-gold-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <ScrollRevealCSS duration={600} y={20}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-[0.1em]">
                    Featured Partners
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Free alcohol delivery to these venues
                  </p>
                </div>
                <Link
                  href="/austin-partners"
                  className="hidden sm:inline-flex items-center gap-2 text-gold-700 hover:text-gold-800 font-medium"
                >
                  Become a Partner
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {partnerVenues.slice(0, 3).map((venue) => (
                  <div
                    key={venue.id}
                    className={`relative bg-white rounded-xl overflow-hidden shadow-lg border-2 ${
                      venue.partnerStatus === 'premier' ? 'border-gold-500' : 'border-gold-300'
                    }`}
                  >
                    {/* Partner Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wide rounded-full ${
                        venue.partnerStatus === 'premier'
                          ? 'bg-gold-500 text-gray-900'
                          : 'bg-gold-400 text-gray-900'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        FREE DELIVERY
                      </span>
                    </div>

                    {venue.partnerStatus === 'premier' && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-2 py-1 bg-gray-900 text-gold-400 text-[10px] font-bold tracking-wider rounded">
                          PREMIER
                        </span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src={venue.image || '/images/venues/default-venue.webp'}
                        alt={venue.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-xl text-gray-900 mb-1">{venue.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{venue.subcategory}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{venue.byobPolicy}</p>

                      <Link
                        href={venue.partnerSlug ? `/venues/${venue.partnerSlug}` : '/products'}
                        className="block w-full text-center px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-gray-900 font-medium rounded transition-colors"
                      >
                        Order Alcohol for This Venue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollRevealCSS>
          </div>
        </section>
      )}

      {/* Filters */}
      <VenueFilters
        activeCategory={activeCategory}
        activeEventType={activeEventType}
        searchQuery={searchQuery}
        showPartnersOnly={showPartnersOnly}
        onCategoryChange={setActiveCategory}
        onEventTypeChange={setActiveEventType}
        onSearchChange={setSearchQuery}
        onPartnersOnlyChange={setShowPartnersOnly}
        venueCounts={venueCounts}
        hiddenOnMobile={hideHeaderOnMobile}
      />

      {/* Venue Grid */}
      <section ref={venueGridRef} className="py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <VenueGrid
            venues={venues}
            activeCategory={activeCategory}
            activeEventType={activeEventType}
            searchQuery={searchQuery}
            showPartnersOnly={showPartnersOnly}
          />
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <ScrollRevealCSS duration={600} y={20}>
            <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em] mb-6">
              Your Guide to Austin BYOB Venues
            </h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p>
                Looking for <strong>Austin BYOB venues</strong> for your wedding, corporate event, or
                celebration? Austin is home to dozens of unique event spaces that allow you to bring
                your own alcohol, saving thousands on bar costs while giving you complete control
                over your beverage selection.
              </p>
              <p>
                From rustic <strong>Hill Country barn venues</strong> and elegant{' '}
                <strong>Lake Travis party boats</strong> to modern industrial spaces in East Austin,
                our directory features {venues.length} verified BYOB venues. Each listing includes
                their specific alcohol policy, so you know exactly what to expect.
              </p>
              <p>
                Partner venues marked with the &quot;Free Delivery&quot; badge offer complimentary alcohol
                delivery from Party On Delivery. Simply{' '}
                <Link href="/products" className="text-gold-600 hover:text-gold-700">
                  browse our selection
                </Link>
                , place your order, and we&apos;ll deliver everything cold and on time to your venue.
              </p>
              <h3>Why Choose a BYOB Venue?</h3>
              <ul>
                <li><strong>Save Money:</strong> Avoid expensive venue bar packages and corkage fees</li>
                <li><strong>Full Control:</strong> Choose exactly what you want to serve your guests</li>
                <li><strong>Better Selection:</strong> Offer craft beers, premium wines, or signature cocktails</li>
                <li><strong>No Waste:</strong> Return unopened bottles for a refund with Party On Delivery</li>
              </ul>
              <p>
                Need help calculating how much alcohol you need? Use our{' '}
                <Link href="/weddings/order" className="text-gold-600 hover:text-gold-700">
                  wedding drink calculator
                </Link>{' '}
                to get personalized recommendations based on your guest count and event duration.
              </p>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <ScrollRevealCSS duration={600} y={20}>
            <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em] mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <FaqItem
                question="What is a BYOB venue in Austin?"
                answer="A BYOB (Bring Your Own Bottle/Beverage) venue allows you to supply your own alcohol for events instead of purchasing through the venue. Most Austin BYOB venues require you to use TABC-certified bartenders to serve the alcohol, but you have full control over what beverages you provide."
              />
              <FaqItem
                question="Do I need a TABC-certified bartender for my Austin event?"
                answer="Yes, Texas law requires bartenders serving alcohol at events to be TABC-certified. Most BYOB venues in Austin will either provide bartenders or require you to hire licensed bartenders. This protects both you and the venue while ensuring responsible alcohol service."
              />
              <FaqItem
                question="How much alcohol do I need for a 100-person wedding?"
                answer="For a 100-person wedding with a 5-hour reception, plan for approximately: 200-300 beers, 15-20 bottles of wine, and 4-5 bottles of each spirit if serving cocktails. Use our drink calculator for personalized recommendations based on your specific event details."
              />
              <FaqItem
                question="Can I return unused alcohol from my event?"
                answer="Yes! Party On Delivery accepts returns of unopened alcohol purchased through us. You can return up to 25% of your order for a full refund, so you never have to worry about over-ordering."
              />
              <FaqItem
                question="What's the cheapest way to have alcohol at an Austin wedding?"
                answer="Choosing a BYOB venue is typically the most cost-effective option. You avoid venue markup on alcohol and corkage fees. Combined with Party On Delivery's competitive pricing and free delivery to partner venues, couples typically save 30-50% compared to traditional venue bar packages."
              />
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Partner CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <ScrollRevealCSS duration={600} y={20}>
            <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.1em] mb-4">
              Own a BYOB Venue?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get listed on this page and start earning commission on every alcohol delivery
              to your venue. Partner venues get the &quot;Free Delivery&quot; badge and priority placement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/austin-partners"
                className="inline-block px-8 py-4 bg-gold-500 text-gray-900 hover:bg-gold-400 transition-colors tracking-[0.1em] text-sm font-medium rounded"
              >
                BECOME A PARTNER
              </Link>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 border border-gray-600 text-white hover:border-gray-500 hover:bg-gray-800 transition-colors tracking-[0.1em] text-sm font-medium rounded"
              >
                CONTACT US
              </Link>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// FAQ Item Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="font-medium text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
