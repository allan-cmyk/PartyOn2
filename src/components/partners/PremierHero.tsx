/**
 * @fileoverview Premier Party Cruises hero with A/B variant support
 * @module components/partners/PremierHero
 */

'use client';

import { useState, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PremierHeroProps {
  /** Hero layout variant - 'left' positions card on left, 'center' centers it */
  variant: 'left' | 'center';
  /** Whether the nav is hidden (affects hero positioning) */
  navHidden?: boolean;
}

/**
 * Premier Party Cruises hero section with glass conversion card
 * Supports A/B testing via variant prop
 */
export default function PremierHero({
  variant,
  navHidden = true,
}: PremierHeroProps): ReactElement {
  const [joinCode, setJoinCode] = useState('');

  const scrollToProducts = () => {
    document.getElementById('boat-collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      window.location.href = `/group/${joinCode.trim().toUpperCase()}`;
    }
  };

  return (
    <section
      className={`
        relative flex items-center overflow-hidden
        ${navHidden
          ? 'min-h-screen pt-20 pb-8'
          : 'h-[calc(100vh-96px)] mt-24'
        }
      `}
    >
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Glass Conversion Card */}
        <div
          className={`
            bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
            p-5 md:p-6 max-w-lg shadow-2xl
            ${variant === 'center' ? 'mx-auto text-center' : 'text-left'}
          `}
        >
          {/* Eyebrow + Partner Logos */}
          <div className={`flex items-center gap-3 mb-4 flex-wrap ${variant === 'center' ? 'justify-center' : ''}`}>
            <Image
              src="/images/partners/premierpartycruises-logo.webp"
              alt="Premier Party Cruises"
              width={120}
              height={60}
              className="h-8 w-auto"
            />
            <span className="text-white/50 text-lg font-light">+</span>
            <Image
              src="/images/pod-logo-2025.svg"
              alt="Party On Delivery"
              width={100}
              height={50}
              className="h-7 w-auto"
            />
          </div>

          {/* Headline */}
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-white mb-2 tracking-wide leading-tight">
            Your Drinks, Iced & Waiting When You Board
          </h1>

          {/* Subhead */}
          <p className="text-gray-200 text-sm md:text-base mb-4 leading-relaxed">
            Skip the liquor store. We deliver to the marina before you arrive.
          </p>

          {/* Primary CTA */}
          <Link
            href="/orders/create"
            className="block w-full py-3 px-6 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wider transition-colors text-center rounded-lg text-sm"
          >
            START A GROUP ORDER
          </Link>

          {/* Friction Reducer */}
          <p className="text-gray-400 text-xs my-2 text-center">
            Takes 2 minutes · No account required · Free delivery
          </p>

          {/* Secondary CTA + Join in one row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={scrollToProducts}
              className="text-white hover:text-gold-300 text-sm tracking-wider underline underline-offset-4"
            >
              Individual order
            </button>
            <span className="text-white/30">|</span>
            <form onSubmit={handleJoinSubmit} className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="Share code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-gold-400 min-w-0"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Join
              </button>
            </form>
          </div>

          {/* Trust Chips - inline */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-white/70">
            {['Free Marina Delivery', '2-Min Ordering', 'TABC Licensed'].map((chip) => (
              <span key={chip} className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {chip}
              </span>
            ))}
          </div>

          {/* Testimonial + Phone - compact row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white/70 italic">&quot;Set up when we arrived!&quot;</span>
            </div>
            <a href="tel:7373719700" className="text-gold-400 hover:text-gold-300 whitespace-nowrap">
              737.371.9700
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
