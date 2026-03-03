'use client';

import type { ReactElement } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * House Tab upsell section for Premier Party Cruises page.
 * Dark section encouraging customers to add a house delivery
 * with Austin Survival Kit and free delivery/stocking perks.
 */
export default function HouseTabUpsell(): ReactElement {
  return (
    <section id="house-tab-upsell" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Eyebrow */}
            <p className="text-sm font-heading uppercase tracking-[0.08em] text-brand-yellow mb-2">
              Bonus
            </p>

            {/* Headlines */}
            <h2 className="font-heading text-3xl md:text-4xl text-white mb-3">
              Get a Free Austin Survival Welcome Package
            </h2>
            <h3 className="font-heading text-xl md:text-2xl text-brand-yellow mb-8">
              Get Free Delivery and Stocking
            </h3>

            {/* How to qualify */}
            <ScrollRevealCSS>
              <div className="border border-brand-yellow/30 rounded-lg p-5 bg-brand-yellow/5 mb-8">
                <p className="text-white font-sans">
                  Spend <strong className="text-brand-yellow">$300+</strong> on a house delivery{' '}
                  and get a <strong className="text-brand-yellow">FREE Austin Survival Welcome Package</strong>{' '}
                  plus <strong className="text-brand-yellow">free delivery &amp; fridge stocking</strong>.
                </p>
              </div>
            </ScrollRevealCSS>

            {/* Value bullets */}
            <div className="space-y-4 mb-8">
              {[
                'Everyone picks drinks for the house AND the boat on one group link',
                'Separate delivery to the house before you arrive',
                'We stock the fridge and fill the cooler',
              ].map((bullet, idx) => (
                <ScrollRevealCSS key={bullet} delay={idx * 100}>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-brand-yellow flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/90 font-sans leading-relaxed">{bullet}</span>
                  </div>
                </ScrollRevealCSS>
              ))}
            </div>

            {/* CTA */}
            <Button variant="cart" size="md" href="/order">
              Order Your Drinks
            </Button>
          </div>

          {/* Right: Austin Survival Kit Image */}
          <ScrollRevealCSS delay={200} className="flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src="/images/products/austin-survival-package.png"
                alt="Austin Survival Welcome Package - included free with $300+ house delivery orders"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            </div>
          </ScrollRevealCSS>
        </div>
      </div>
    </section>
  );
}
