'use client';

import type { ReactElement } from 'react';
import Button from '@/components/Button';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import WelcomePackageGrid from '@/components/partners/WelcomePackageGrid';

const VALUE_BULLETS = [
  'Bigger shared order — everyone picks drinks for the house AND the boat',
  'Same group link — one code, two deliveries',
  'Separate delivery to the house before you arrive',
];

/**
 * House Tab upsell section for Premier Party Cruises page.
 * Dark section encouraging customers to add a house delivery.
 */
export default function HouseTabUpsell(): ReactElement {
  return (
    <section id="house-tab-upsell" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        {/* Eyebrow */}
        <p className="text-sm font-heading uppercase tracking-[0.08em] text-brand-yellow text-center mb-2">
          Bonus
        </p>

        {/* Headline */}
        <h2 className="font-heading text-3xl md:text-4xl text-white text-center mb-10">
          Stock the Airbnb too
        </h2>

        {/* Value bullets */}
        <div className="max-w-2xl mx-auto space-y-4 mb-10">
          {VALUE_BULLETS.map((bullet, idx) => (
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

        {/* Incentive callout card */}
        <ScrollRevealCSS delay={300}>
          <div className="max-w-2xl mx-auto mb-10 border border-brand-yellow/30 rounded-lg p-5 bg-brand-yellow/5">
            <p className="text-white text-center font-sans">
              Spend <strong className="text-brand-yellow">$250+</strong> on House Tab{' '}
              &rarr; choose a <strong className="text-brand-yellow">FREE Welcome Package</strong>{' '}
              <span className="text-white/60">($50 value)</span>
            </p>
          </div>
        </ScrollRevealCSS>

        {/* Welcome Package Grid preview */}
        <div className="mb-10">
          <WelcomePackageGrid />
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3">
          <Button variant="cart" size="md" href="/group/create">
            Start a Group Order &rarr;
          </Button>
          <a
            href="#experience-proof"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('experience-proof')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-white/50 hover:text-white/70 text-sm font-sans transition-colors"
          >
            Skip &mdash; boat only
          </a>
        </div>
      </div>
    </section>
  );
}
