/**
 * /partners/<slug>/welcome
 *
 * Co-branded landing page that customers reach by clicking a CTA in a
 * partner's confirmation email (e.g. FareHarbor's booking confirmation for
 * Centex Boat Rentals) or any other partner-driven link.
 *
 * Surface: a single email-or-phone capture form. On submit, posts to
 * /api/v1/partner-lead which attributes via the ref_code cookie set by
 * middleware on this exact URL (see src/middleware.ts — /partners/<slug>
 * already triggers the cookie).
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { getAffiliateBySlug } from '@/lib/affiliates/affiliate-service';
import WelcomeForm from '@/components/partner-welcome/WelcomeForm';

interface Props {
  params: Promise<{ slug: string }>;
}

const HERO_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Convention-based asset resolution: drop a logo at
 * /public/images/partners/<slug>-logo.png and a hero at
 * /public/images/partners/<slug>-hero.{jpg,jpeg,png,webp}. Returns null when
 * not present — the layout degrades gracefully.
 */
function findPartnerAssets(slug: string): { logo: string | null; hero: string | null } {
  let logo: string | null = null;
  const logoCandidate = `/images/partners/${slug}-logo.png`;
  if (fs.existsSync(path.join(process.cwd(), 'public', logoCandidate))) {
    logo = logoCandidate;
  }

  let hero: string | null = null;
  for (const ext of HERO_IMAGE_EXTS) {
    const candidate = `/images/partners/${slug}-hero.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), 'public', candidate))) {
      hero = candidate;
      break;
    }
  }
  return { logo, hero };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const affiliate = await getAffiliateBySlug(slug);
  if (!affiliate || !['ACTIVE', 'DRAFT'].includes(affiliate.status)) {
    return { title: 'Partner Not Found' };
  }
  return {
    title: `${affiliate.businessName} x Party On Delivery — ${affiliate.customerPerk}`,
    description: `Booked with ${affiliate.businessName}? Make your trip legendary — get drinks delivered free with Party On Delivery.`,
    // Don't index — this page is meant for customers who arrive via a
    // partner's confirmation email, not for general search traffic.
    robots: { index: false, follow: true },
  };
}

export default async function PartnerWelcomePage({ params }: Props) {
  const { slug } = await params;
  const affiliate = await getAffiliateBySlug(slug);
  if (!affiliate || !['ACTIVE', 'DRAFT'].includes(affiliate.status)) {
    notFound();
  }

  const { logo, hero } = findPartnerAssets(affiliate.partnerSlug ?? slug);
  const partnerSlug = affiliate.partnerSlug ?? slug;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero — short, focused */}
      <section className="relative h-[40vh] md:h-[50vh] mt-24 flex items-center justify-center overflow-hidden">
        {hero ? (
          <Image src={hero} alt="" fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-brand-blue" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/70" />

        <div className="relative text-center text-white z-10 max-w-3xl mx-auto px-8">
          {logo && (
            <div className="mb-6 inline-block bg-white/95 rounded-xl px-6 py-3">
              <Image src={logo} alt={`${affiliate.businessName} logo`} width={180} height={60} className="h-12 w-auto" />
            </div>
          )}
          <h1 className="font-heading tracking-[0.1em] text-4xl md:text-5xl lg:text-6xl uppercase">
            Welcome,
            <br />
            {affiliate.businessName} guest
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-100">
            {affiliate.customerPerk} on your booze, ice, mixers &amp; cups —
            delivered to your dock, hotel, or short-term rental.
          </p>
        </div>
      </section>

      {/* Capture form */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-2xl">
          <div className="card">
            <h2 className="font-heading tracking-[0.1em] text-3xl md:text-4xl text-gray-900 uppercase">
              Lock in your perk
            </h2>
            <p className="mt-3 text-base text-gray-700">
              Drop your email or phone and we&apos;ll text you a one-tap link
              to start your delivery order. {affiliate.customerPerk} on orders
              of $150 or more — use code{' '}
              <span className="font-mono font-bold text-brand-blue">
                {affiliate.code}
              </span>{' '}
              at checkout.
            </p>
            <div className="mt-6">
              <WelcomeForm
                partnerSlug={partnerSlug}
                partnerName={affiliate.businessName}
                perk={affiliate.customerPerk}
              />
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <CheckIcon />
              <span><strong>Same-day delivery</strong> across Austin &amp; Lake Travis</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon />
              <span><strong>Premium spirits, beer, seltzers</strong> &mdash; the brands you actually want</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon />
              <span><strong>Delivered to the dock</strong> if you&apos;re on the water</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-brand-blue flex-shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
