'use client';

import Image from 'next/image';
import Link from 'next/link';
import { premierPartyCruises } from '@/lib/partners/landing-pages';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import PartnerHero from '@/components/partners/PartnerHero';
import OrderTypeSelector from '@/components/partners/OrderTypeSelector';
import PartnerFAQ from '@/components/partners/PartnerFAQ';
import DrinkCalculator from '@/components/partners/DrinkCalculator';

/**
 * Premier Party Cruises partner landing page
 * TEMPLATE: This page serves as the template for all partner landing pages
 *
 * Sections:
 * 1. Navigation
 * 2. Hero (video background)
 * 3. About the Venue
 * 4. Order Selection
 * 5. What's Included (Services)
 * 6. Testimonials
 * 7. FAQ
 * 8. Drink Calculator
 * 9. Final CTA
 * 10. Footer
 *
 * Note: Metadata is defined in layout.tsx for SEO
 */

export default function PremierPartyCruisesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Navigation */}
      <OldFashionedNavigation />

      {/* 2. Hero Section with YouTube Video Background */}
      <PartnerHero partner={premierPartyCruises} />

      {/* 3. About the Venue Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <p className="text-gold-600 tracking-[0.2em] uppercase text-sm mb-3">
                About the Venue
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6 tracking-wide">
                Austin&apos;s Favorite Party Boat Experience
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Premier Party Cruises</strong> has been Austin&apos;s top-rated party boat
                  rental company since 2009. With a fleet of boats accommodating 5-75 guests,
                  they&apos;ve hosted over 150,000 happy customers on Lake Travis.
                </p>
                <p>
                  Whether you&apos;re planning a bachelorette party, birthday celebration, corporate
                  event, or just a fun day on the lake, Premier Party Cruises provides everything
                  you need for an unforgettable experience.
                </p>
                <p>
                  As a <span className="text-gold-600 font-semibold">Premier Partner</span>,
                  PartyOn Delivery provides free alcohol delivery directly to their marina.
                  We&apos;ll even stock your coolers for you!
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://premierpartycruises.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Visit Their Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => document.getElementById('start-order')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-gray-900 hover:bg-gold-600 rounded-lg transition-colors font-medium"
                >
                  Order Drinks Now
                </button>
              </div>
            </div>
            {/* Image */}
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="https://premierpartycruises.com/attached_assets/bachelor-party-group-guys-hero-compressed.webp"
                  alt="Premier Party Cruises boat party on Lake Travis"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Partner Badge */}
              <div className="absolute -bottom-4 -right-4 bg-gold-500 text-gray-900 px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-sm">PREMIER PARTNER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Order Type Selection Section */}
      <OrderTypeSelector
        orderTypes={premierPartyCruises.orderTypes}
        partnerId={premierPartyCruises.slug}
      />

      {/* 5. What's Included Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold-600 tracking-[0.2em] uppercase text-sm mb-3">
              What You Get
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
              The PartyOn Delivery Experience
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We handle all the alcohol logistics so you can focus on having fun on the lake
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3">Free Marina Delivery</h3>
              <p className="text-gray-600">
                We deliver directly to the Premier Party Cruises marina on Lake Travis.
                Your drinks will be cold and ready when you arrive.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3">Cooler Stocking</h3>
              <p className="text-gray-600">
                We&apos;ll organize everything in your coolers with ice so it&apos;s perfectly
                chilled and ready to serve. No setup hassle for you.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3">Easy Returns</h3>
              <p className="text-gray-600">
                Over-ordered? No problem. Return up to 25% of unopened products for a
                full refund. You never have to worry about waste.
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3">Group Ordering</h3>
              <p className="text-gray-600">
                Share a link with your group and let everyone add their drinks.
                One combined order, one delivery, no coordination headaches.
              </p>
            </div>

            {/* Service 5 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3">Expert Recommendations</h3>
              <p className="text-gray-600">
                Not sure how much to order? Use our drink calculator or ask us.
                We&apos;ve done 500+ boat parties and know what works.
              </p>
            </div>

            {/* Service 6 */}
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-3">Licensed & Insured</h3>
              <p className="text-gray-600">
                We&apos;re fully TABC licensed and carry liability insurance.
                Everything is done by the book so you can relax.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold-400 tracking-[0.2em] uppercase text-sm mb-3">
              Happy Customers
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 tracking-wide">
              What Boat Party Hosts Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                &quot;PartyOn made our bachelorette boat party SO easy. They delivered everything
                to the marina and even packed our coolers. We didn&apos;t have to do anything!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  S
                </div>
                <div>
                  <p className="text-white font-medium">Sarah M.</p>
                  <p className="text-gray-400 text-sm">Bachelorette Party Host</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                &quot;The group ordering feature was perfect for our corporate team outing.
                Everyone picked what they wanted and it all showed up together. Great service!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  M
                </div>
                <div>
                  <p className="text-white font-medium">Mike T.</p>
                  <p className="text-gray-400 text-sm">Corporate Event Organizer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                &quot;We over-ordered and they took back the unopened bottles no questions asked.
                Amazing customer service and the drinks were ice cold. Highly recommend!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  J
                </div>
                <div>
                  <p className="text-white font-medium">Jennifer K.</p>
                  <p className="text-gray-400 text-sm">Birthday Party Host</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <PartnerFAQ faqs={premierPartyCruises.faqs} />

      {/* 8. Drink Calculator Section */}
      <DrinkCalculator />

      {/* 9. Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            Ready for Your Lake Travis Adventure?
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Let us handle the drinks while you enjoy the lake. Start your order now
            and get free delivery to the Premier Party Cruises marina.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('start-order')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors font-semibold text-lg"
            >
              Start Your Order
            </button>
            <Link
              href="/products"
              className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-semibold text-lg"
            >
              Browse All Products
            </Link>
          </div>
          <p className="mt-6 text-gray-700 text-sm">
            Questions? Call us at{' '}
            <a href="tel:7373719700" className="font-semibold underline">
              737.371.9700
            </a>
          </p>
        </div>
      </section>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
