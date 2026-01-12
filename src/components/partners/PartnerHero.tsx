'use client';

import { useState, type ReactElement } from 'react';
import PartnerHeroVideo from './PartnerHeroVideo';
import JoinOrderModal from './JoinOrderModal';
import type { PartnerLandingPage, BulletPoint } from '@/lib/partners/types';

interface PartnerHeroProps {
  partner: PartnerLandingPage;
}

/** Icon component for bullet points */
function BulletIcon({ type }: { type: BulletPoint['icon'] }): ReactElement {
  const iconClass = 'w-5 h-5 text-gold-400';

  switch (type) {
    case 'delivery':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      );
    case 'group':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'perks':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      );
    case 'check':
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}

/** Price indicator display */
function PriceIndicator({ price }: { price: '$' | '$$' | '$$$' }): ReactElement {
  return (
    <div className="flex items-center gap-1 text-gold-400">
      {price.split('').map((_, i) => (
        <span key={i} className="text-lg font-semibold">$</span>
      ))}
      {/* Gray out remaining dollar signs */}
      {Array(3 - price.length).fill(null).map((_, i) => (
        <span key={`empty-${i}`} className="text-lg font-semibold text-gray-600">$</span>
      ))}
    </div>
  );
}

/**
 * Partner hero section with YouTube video background and CTAs
 * Follows hero section standards: h-[70vh] md:h-[80vh] mt-24
 */
export default function PartnerHero({ partner }: PartnerHeroProps): ReactElement {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const scrollToOrder = () => {
    document.getElementById('start-order')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative h-[70vh] md:h-[80vh] mt-24 flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        {partner.heroVideoId && partner.heroImageUrl && (
          <PartnerHeroVideo
            videoId={partner.heroVideoId}
            fallbackImage={partner.heroImageUrl}
            alt={partner.name}
          />
        )}

        {/* Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          {/* Partner Name & Tagline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-2 tracking-wide">
            {partner.name}
          </h1>
          <p className="text-gold-400 uppercase tracking-[0.2em] text-sm md:text-base mb-6">
            {partner.tagline}
          </p>

          {/* Price Indicator */}
          <div className="flex justify-center mb-6">
            <PriceIndicator price={partner.priceIndicator} />
          </div>

          {/* Bullet Points */}
          <ul className="space-y-3 mb-8 text-left max-w-xl mx-auto">
            {partner.bulletPoints.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5">
                  <BulletIcon type={bullet.icon} />
                </span>
                <span className="text-base md:text-lg text-white/90">
                  {bullet.text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToOrder}
              className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-gray-900 font-semibold rounded-lg transition-colors text-lg tracking-wide"
            >
              Start an Order
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors text-lg tracking-wide border border-white/30"
            >
              Join an Order
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Join Order Modal */}
      <JoinOrderModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </>
  );
}
