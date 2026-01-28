/**
 * @fileoverview Premier Party Cruises hero - clean 3-band layout
 * @module components/partners/PremierHero
 */

'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Premier Party Cruises hero section - simplified conversion card
 * Layout: Identity/Promise → Action → Utility/Trust
 */
export default function PremierHero(): ReactElement {
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/30" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-center">
        {/* Glass Conversion Card - Centered Content */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 md:p-6 max-w-lg shadow-2xl text-center">

          {/* Partner Logos + Titles - Single Row */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-5">
            <Image
              src="/images/partners/premierpartycruises-logo.webp"
              alt="Premier Party Cruises"
              width={40}
              height={40}
              className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
            />
            <span className="text-[11px] md:text-sm text-white/70 tracking-wide whitespace-nowrap">
              Premier Party Cruises <span className="text-white/40">×</span> Party On Delivery
            </span>
            <Image
              src="/images/pod-logo-2025.svg"
              alt="Party On Delivery"
              width={40}
              height={40}
              className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
            />
          </div>

          {/* BAND A: Identity + Promise */}
          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-3 tracking-wide leading-tight">
              Your Drinks, Iced & Waiting When You Board
            </h1>
            <p className="text-gray-300 text-base md:text-lg">
              Delivered to the marina before you arrive.
            </p>
          </div>

          {/* BAND B: Action */}
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToProducts}
                className="flex-1 h-12 md:h-14 px-4 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wide transition-colors rounded-lg text-base md:text-lg"
              >
                Shop Drinks
              </button>
              <button
                onClick={scrollToCalculator}
                className="flex-1 h-12 md:h-14 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold tracking-wide transition-colors rounded-lg text-sm md:text-base border-2 border-white/40"
              >
                Get Recommendations
              </button>
            </div>
            <p className="text-sm text-white/50 mt-3">
              Checkout on this page • Recommendations in 60 seconds
            </p>
          </div>

          {/* BAND C: Utility + Trust */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            {/* Utility Row - Group Order + Join */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
              <Link
                href="/orders/create"
                className="text-white/70 hover:text-white transition-colors"
              >
                Ordering with friends? <span className="text-gold-400">Start a group →</span>
              </Link>

              <span className="text-white/20 hidden sm:inline">|</span>

              {!showJoinInput ? (
                <button
                  onClick={() => setShowJoinInput(true)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Joining a group? <span className="text-gold-400">Enter code</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    id="shareCode"
                    name="shareCode"
                    className="h-8 w-20 rounded bg-black/30 border border-white/20 px-2 text-white text-sm text-center
                               placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold-400/50"
                    placeholder="CODE"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={!joinCode.trim()}
                    className="h-8 rounded px-3 text-sm text-gold-400 hover:text-gold-300 transition
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Join
                  </button>
                </div>
              )}
            </div>

            {/* Trust Row - 3 items only */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free Marina Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                TABC Licensed
              </span>
              <span className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
            </div>

            {/* Phone - footer */}
            <p className="text-sm text-white/50">
              Questions? Text <a href="tel:7373719700" className="text-gold-400 hover:text-gold-300">737-371-9700</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
