'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import CategoryFilter from '@/components/partners/CategoryFilter';
import PartnerGrid from '@/components/partners/PartnerGrid';
import partnersData from '@/data/austin-partners.json';
import type { Partner, PartnerCategory } from '@/lib/partners/types';
import { PARTNER_CATEGORIES } from '@/lib/partners/types';

export default function AustinPartnersPage() {
  const [activeCategory, setActiveCategory] = useState<PartnerCategory | 'all'>('all');
  const partners = partnersData.partners as Partner[];

  // Calculate partner counts for each category
  const partnerCounts = useMemo(() => {
    const counts: Record<PartnerCategory | 'all', number> = {
      all: partners.length,
      'event-planning': 0,
      'mobile-bartending': 0,
      venues: 0,
      catering: 0,
      boats: 0,
      transportation: 0,
    };

    partners.forEach((partner) => {
      if (counts[partner.category] !== undefined) {
        counts[partner.category]++;
      }
    });

    return counts;
  }, [partners]);

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/austin-skyline-golden-hour.webp"
            alt="Austin skyline at golden hour - event partners directory"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-white">
          <ScrollRevealCSS duration={800} y={30}>
            <p className="text-gold-400 tracking-[0.2em] uppercase text-sm mb-4">
              Partner Directory
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-6 tracking-[0.1em] max-w-4xl">
              Our Austin Partners
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl leading-relaxed text-gray-200">
              Discover the best local vendors for your next Austin event. From
              wedding planners to boat rentals, we&apos;ve partnered with
              Austin&apos;s top event professionals.
            </p>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        partnerCounts={partnerCounts}
      />

      {/* Partners Grid */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <PartnerGrid partners={partners} activeCategory={activeCategory} />
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <ScrollRevealCSS duration={600} y={20}>
            <h2 className="font-serif text-3xl text-gray-900 tracking-[0.1em] mb-6">
              Your Guide to Austin Events
            </h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p>
                Austin is known for its vibrant event scene, from lakeside
                weddings at{' '}
                <Link href="/boat-parties" className="text-gold-600 hover:text-gold-700">
                  Lake Travis
                </Link>{' '}
                to unforgettable{' '}
                <Link href="/bach-parties" className="text-gold-600 hover:text-gold-700">
                  bachelorette parties
                </Link>{' '}
                on South Congress. Our partners represent the best of what
                Austin has to offer for event planning and execution.
              </p>
              <p>
                Whether you&apos;re planning a{' '}
                <Link href="/corporate" className="text-gold-600 hover:text-gold-700">
                  corporate event
                </Link>
                , a milestone celebration, or an intimate gathering, these
                trusted vendors can help bring your vision to life. From
                professional mobile bartenders and TABC-certified staff to
                unique venues and reliable transportation, every partner has
                been vetted for quality and service.
              </p>
              <p>
                Combined with Party On Delivery&apos;s{' '}
                <Link href="/products" className="text-gold-600 hover:text-gold-700">
                  premium alcohol delivery
                </Link>
                , you have everything you need to create an unforgettable Austin
                experience. Let us handle the drinks while our partners take
                care of the rest.
              </p>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <ScrollRevealCSS duration={600} y={20}>
            <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.1em] mb-4">
              Become a Partner
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join Austin&apos;s premier network of event professionals. Partner
              with Party On Delivery to reach more customers and grow your
              business.
            </p>
            <Link
              href="/partners"
              className="inline-block px-8 py-4 bg-gold-600 text-black hover:bg-gold-500 transition-colors tracking-[0.1em] text-sm font-medium rounded-sm"
            >
              LEARN ABOUT PARTNERSHIP
            </Link>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <ScrollRevealCSS duration={600} y={20}>
            <h2 className="font-serif text-2xl text-gray-900 tracking-[0.1em] mb-8 text-center">
              Explore Austin Events
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PARTNER_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="p-6 bg-gray-50 hover:bg-gold-50 rounded-lg text-center transition-colors group"
                >
                  <span className="block font-serif text-lg text-gray-900 group-hover:text-gold-700 tracking-[0.05em] mb-1">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {partnerCounts[category.id]} partner
                    {partnerCounts[category.id] !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      <Footer />
    </div>
  );
}
