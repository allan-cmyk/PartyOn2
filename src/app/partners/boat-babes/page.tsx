'use client';

import { useState, Suspense, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from "@/components/Navigation";
import Footer from '@/components/Footer';
import JoinOrderModal from '@/components/partners/JoinOrderModal';
import BoatBabesHero from '@/components/partners/BoatBabesHero';

/** Boat Babes testimonials from their website */
const TESTIMONIALS = [
  {
    reviewer: 'Bachelor Party Group',
    text: 'Best bachelor party service ever. The girls were so fun and took amazing care of us.',
  },
  {
    reviewer: 'Birthday Bash Crew',
    text: 'From the second we stepped on the boat, the babes had us covered. We are coming back next summer and will hire them again!',
  },
];

/**
 * Boat Babes - Drink Delivery Service Landing Page
 * Optimized for customers who have booked a Boat Babes experience
 */
function BoatBabesPageContent(): ReactElement {
  const searchParams = useSearchParams();
  void searchParams;

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation - Always hidden on this partner page */}
      <Navigation hidden />

      {/* HERO SECTION */}
      <BoatBabesHero />

      {/* VIDEO + WHAT'S INCLUDED SECTION */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-500 tracking-[0.1em] uppercase text-sm mb-2">
              See the Vibes
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-gray-900 tracking-wide">
              A Day with Boat Babes
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            {/* Instagram Reel - Takes 3 columns on desktop */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl bg-gray-900">
                <iframe
                  src="https://www.instagram.com/reel/DT_T77Tkn96/embed/"
                  title="Boat Babes getting ready for Austin lake season"
                  className="w-full border-0"
                  style={{ minHeight: '500px' }}
                  allowFullScreen
                  scrolling="no"
                />
              </div>
            </div>

            {/* What's Included - Takes 2 columns on desktop */}
            <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-lg flex flex-col">
              <p className="text-gray-500 tracking-[0.1em] uppercase text-base mb-2 text-center">
                Lake Day = Handled
              </p>
              <h3 className="font-heading text-2xl md:text-3xl text-gray-900 tracking-wide mb-6 text-center">
                Every Order Includes
              </h3>
              <div className="space-y-4 flex-grow">
                {[
                  { item: 'FREE delivery to your marina', value: '$50' },
                  { item: 'Cooler stocking with ice', value: '$25' },
                  { item: 'Group ordering with split payments', value: 'FREE' },
                  { item: 'Your drinks ready when Boat Babes arrive', value: 'FREE' },
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
              <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center">
                <span className="font-heading text-lg text-gray-900">Total Value</span>
                <span className="font-heading text-xl text-gray-900 font-semibold">$75+ FREE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-16 px-6 md:px-12 bg-gray-100 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gray-500 tracking-[0.1em] uppercase text-sm mb-3">
              Real Reviews
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 tracking-wide">
              What Boat Babes Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {TESTIMONIALS.map((review, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
                <p className="font-medium text-gray-900">&mdash; {review.reviewer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-20 px-6 md:px-12 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* LEFT: Video/GIF */}
            <div className="flex justify-center lg:justify-end items-stretch">
              <div className="relative w-48 md:w-56 lg:w-full lg:max-w-xs rounded-2xl overflow-hidden bg-gray-800 shadow-2xl aspect-[9/16] lg:aspect-auto">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/videos/trust-section.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* RIGHT: Logo + Title + Paragraph */}
            <div className="flex flex-col">
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/pod-logo-2025.svg"
                  alt="Party On Delivery"
                  width={180}
                  height={180}
                  className="w-32 h-32 md:w-44 md:h-44"
                />
              </div>

              <h2 className="font-heading text-3xl md:text-4xl text-white tracking-wide mb-6 text-center">
                Austin-Born. Fully Licensed. Always On Time.
              </h2>

              <p className="text-gray-300 text-lg md:text-xl leading-relaxed text-center">
                Howdy! We&apos;re Allan and Brian, owners of Party On Delivery. Austin natives with 15+ years in events and hospitality, we built this business around one thing: taking care of people. We pride ourselves on clear communication, on-time delivery, and showing people the best of our great city. Our goal is simple - make your weekend easy, safe, and fun.
              </p>
              <p className="text-brand-yellow text-xl md:text-2xl font-heading mt-6 text-center tracking-wide">
                PARTY ON Y&apos;ALL
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-br from-yellow-500 to-brand-yellow">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            Ready for the Lake?
          </h2>
          <p className="text-gray-800 text-lg mb-8 max-w-2xl mx-auto">
            Get your drinks delivered before you board. Free delivery. Easy group ordering. Zero hassle.
          </p>

          <div className="flex flex-col items-center gap-3 mb-6">
            <Link
              href="/order"
              className="px-10 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold tracking-wider transition-colors rounded-lg"
            >
              Start an Order
            </Link>
          </div>

          <p className="text-gray-700">
            Questions? Call us:{' '}
            <a href="tel:7373719700" className="font-semibold underline">
              737.371.9700
            </a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {/* MODALS */}
      <JoinOrderModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}

/**
 * Page wrapper with Suspense boundary for useSearchParams
 */
export default function BoatBabesPage(): ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BoatBabesPageContent />
    </Suspense>
  );
}
