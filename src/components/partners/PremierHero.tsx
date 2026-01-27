/**
 * @fileoverview Premier Party Cruises hero with A/B variant support
 * @module components/partners/PremierHero
 */

'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Premier Party Cruises hero section with glass conversion card
 */
export default function PremierHero(): ReactElement {
  const [joinCode, setJoinCode] = useState('');

  const scrollToProducts = () => {
    document.getElementById('product-grid')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToCalculator = () => {
    document.getElementById('order-builder')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      window.location.href = `/group/${joinCode.trim().toUpperCase()}`;
    }
  };

  return (
    <section className="relative min-h-[100vh] md:min-h-[70vh] pt-28 pb-8 md:pt-0 flex items-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/partners/premierpartycruises-hero.webp"
        alt="Premier Party Cruises boat party on Lake Travis"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Gradient Overlay - stronger on left for card readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/30" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-center">
        {/* Glass Conversion Card */}
        <div
          className={`
            bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
            p-4 md:p-5 max-w-xl shadow-2xl text-center
          `}
        >
          {/* Eyebrow */}
          <p className="text-xs text-white/50 uppercase tracking-widest mb-3">
            Premier Party Cruises × Party On Delivery
          </p>

          {/* Headline */}
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-white mb-2 tracking-wide leading-tight">
            Your Drinks, Iced & Waiting When You Board
          </h1>

          {/* Subhead */}
          <p className="text-gray-200 text-sm md:text-base mb-4 leading-relaxed">
            Skip the liquor store. We deliver to the marina before you arrive.
          </p>

          {/* Two Main CTAs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <button
                onClick={scrollToProducts}
                className="w-full h-12 px-5 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wider transition-colors rounded-lg text-base"
              >
                Pick Your Drinks
              </button>
              <p className="text-xs text-white/50 mt-1.5">Checkout right on this page</p>
            </div>
            <div>
              <button
                onClick={scrollToCalculator}
                className="w-full h-12 px-5 bg-white/10 hover:bg-white/20 text-white font-semibold tracking-wider transition-colors rounded-lg text-base border-2 border-white/40"
              >
                Get a Recommended Order
              </button>
              <p className="text-xs text-white/50 mt-1.5">Not sure what to buy? We&apos;ll help</p>
            </div>
          </div>

          {/* Utility Bar: Group Order + Join with Code */}
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-3 border-t border-white/10">
            {/* Group ordering */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/60">Ordering with friends?</span>
              <Link
                href="/orders/create"
                className="inline-flex items-center gap-1 font-semibold text-gold-400 hover:underline"
              >
                Start a Group Order →
              </Link>
            </div>

            <span className="hidden sm:block text-white/20">|</span>

            {/* Join with code */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60" htmlFor="shareCode">
                Have a code?
              </label>
              <input
                id="shareCode"
                name="shareCode"
                className="h-9 w-24 rounded-lg bg-black/30 border border-white/20 px-2 text-white text-sm text-center
                           placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/25"
                placeholder="CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                inputMode="text"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="h-9 rounded-lg px-3 font-semibold text-white text-sm
                           bg-white/10 hover:bg-white/20 border-2 border-white/40 transition
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Join
              </button>
            </div>
          </div>

          {/* Footer: Trust Chips + Testimonial + Phone */}
          <div className="mt-3 pt-3 border-t border-white/10">
            {/* Trust Chips */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60 justify-center">
              {['Free Marina Delivery', '2-Min Ordering', 'TABC Licensed'].map((chip) => (
                <span key={chip} className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {chip}
                </span>
              ))}
            </div>

            {/* Social Proof + Phone */}
            <div className="flex items-center gap-4 mt-2 text-xs justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-white/60">1000s served</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <a href="tel:7373719700" className="text-gold-400 hover:text-gold-300 whitespace-nowrap">
                737.371.9700
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
