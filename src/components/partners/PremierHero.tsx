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
  /** Callback when user wants to join an existing order */
  onJoinOrder: () => void;
}

/**
 * Premier Party Cruises hero section with glass conversion card
 * Supports A/B testing via variant prop
 */
export default function PremierHero({
  variant,
  onJoinOrder,
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
    <section className="relative h-[calc(100vh-96px)] mt-24 flex items-center overflow-hidden">
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
            bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl
            p-6 md:p-8 max-w-xl shadow-2xl
            ${variant === 'center' ? 'mx-auto text-center' : 'text-left'}
          `}
        >
          {/* Eyebrow */}
          <p className="text-gold-400 tracking-[0.15em] uppercase text-xs mb-4">
            Official Partner of Premier Party Cruises
          </p>

          {/* Partner Logos */}
          <div className={`flex items-center gap-3 mb-5 flex-wrap ${variant === 'center' ? 'justify-center' : ''}`}>
            <Image
              src="/images/partners/premierpartycruises-logo.webp"
              alt="Premier Party Cruises"
              width={140}
              height={70}
              className="h-10 w-auto"
            />
            <span className="text-white/50 text-xl font-light">+</span>
            <Image
              src="/images/pod-logo-2025.svg"
              alt="Party On Delivery"
              width={120}
              height={60}
              className="h-9 w-auto"
            />
          </div>

          {/* Headline */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-3 tracking-wide leading-tight">
            Your Drinks, Iced & Waiting When You Board
          </h1>

          {/* Subhead */}
          <p className="text-gray-200 text-base md:text-lg mb-6 leading-relaxed">
            Skip the liquor store. We deliver to the marina before you arrive.
          </p>

          {/* Primary CTA */}
          <Link
            href="/orders/create"
            className="block w-full py-4 px-6 bg-gold-500 hover:bg-gold-400 text-gray-900 font-semibold tracking-wider transition-colors text-center rounded-lg mb-2"
          >
            START A GROUP ORDER
          </Link>

          {/* Friction Reducer */}
          <p className="text-gray-400 text-xs mb-4 text-center">
            Takes 2 minutes · No account required · Free delivery
          </p>

          {/* Secondary CTA */}
          <button
            onClick={scrollToProducts}
            className="block w-full text-white hover:text-gold-300 font-medium tracking-wider underline underline-offset-4 mb-4 text-center"
          >
            or start an individual order
          </button>

          {/* Join Code Input */}
          <form onSubmit={handleJoinSubmit} className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="Have a share code?"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-gold-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Join
            </button>
          </form>

          {/* Trust Chips */}
          <div className="flex flex-wrap gap-2 mb-5 justify-center">
            {[
              'Free Marina Delivery',
              '2-Min Group Ordering',
              'TABC Licensed',
            ].map((chip) => (
              <span
                key={chip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/80"
              >
                <svg className="w-3.5 h-3.5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {chip}
              </span>
            ))}
          </div>

          {/* Testimonial One-Liner */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 mb-4">
            <div className="flex -space-x-0.5 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 text-xs italic leading-snug">
              &quot;Everything was set up by the time we arrived!&quot;
              <span className="text-white/50 not-italic ml-1">— Kirby P.</span>
            </p>
          </div>

          {/* Phone Help */}
          <p className="text-gray-400 text-xs text-center">
            Need help? Text{' '}
            <a href="tel:7373719700" className="text-gold-400 hover:text-gold-300">
              737.371.9700
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
