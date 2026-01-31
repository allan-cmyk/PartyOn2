/**
 * @fileoverview Premier Party Cruises hero - split two-column layout
 * @module components/partners/PremierHero
 */

'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Premier Party Cruises hero section - split layout
 * Left: headline, CTAs, group order, phone
 * Right: partner logos, hero image, trust signals
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
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/partners/premierpartycruises-hero-bg3.webp.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">

          {/* Left Column: Content */}
          <div className="order-1 text-center">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-wide leading-tight">
              Your Drinks, Iced &amp; Waiting When You Board
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              Delivered to the marina before you arrive.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={scrollToProducts}
                className="flex-1 h-14 md:h-16 px-8 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wide transition-colors rounded-lg text-lg md:text-xl"
              >
                Shop Drinks
              </button>
              <button
                onClick={scrollToCalculator}
                className="flex-1 h-14 md:h-16 px-8 border-2 border-white/40 hover:bg-white/20 text-white font-semibold tracking-wide transition-colors rounded-lg text-lg md:text-xl"
              >
                See Drink Calculator
              </button>
            </div>

            {/* Group Order + Join */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-base mb-4">
              <Link
                href="/group-v2/create"
                className="text-white/70 hover:text-white transition-colors"
              >
                Ordering with friends?{' '}
                <span className="text-gold-400 font-medium">Start a group &rarr;</span>
              </Link>

              <span className="text-white/20 hidden sm:inline">|</span>

              {!showJoinInput ? (
                <button
                  onClick={() => setShowJoinInput(true)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Joining a group?{' '}
                  <span className="text-gold-400 font-medium">Enter code</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    id="shareCode"
                    name="shareCode"
                    className="h-9 w-24 rounded bg-black/30 border border-white/20 px-2 text-white text-base text-center
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
                    className="h-9 rounded px-3 text-base text-gold-400 font-medium hover:text-gold-300 transition
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Join
                  </button>
                </div>
              )}
            </div>

            {/* Phone */}
            <p className="text-base text-white/50">
              Questions? Text{' '}
              <a href="tel:7373719700" className="text-gold-400 hover:text-gold-300 font-medium">
                737-371-9700
              </a>
            </p>
          </div>

          {/* Right Column: Logos + Image + Trust */}
          <div className="order-2 flex flex-col gap-5">
            {/* Partner Logos Row */}
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/images/partners/premierpartycruises-logo.webp"
                alt="Premier Party Cruises"
                width={44}
                height={44}
                className="h-9 md:h-11 w-auto object-contain"
              />
              <span className="text-xs md:text-sm text-white/70 tracking-wide whitespace-nowrap">
                Premier Party Cruises{' '}
                <span className="text-white/40">&times;</span>{' '}
                Party On Delivery
              </span>
              <Image
                src="/images/pod-logo-2025.svg"
                alt="Party On Delivery"
                width={44}
                height={44}
                className="h-9 md:h-11 w-auto object-contain"
              />
            </div>

            {/* Hero Image */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-white/10">
              <Image
                src="/images/partners/premierpartycruises-hero.webp"
                alt="Premier Party Cruises boat party on Lake Travis"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Trust Signals Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/60">
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
                  <svg key={i} className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
