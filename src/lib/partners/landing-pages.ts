/**
 * Partner Landing Page Data
 * Contains data for dedicated partner landing pages with ordering functionality
 * To add a new partner: copy an existing entry and modify the values
 */

import type { PartnerLandingPage } from './types';

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Premier Party Cruises - Lake Travis boat party rentals
 */
export const premierPartyCruises: PartnerLandingPage = {
  slug: 'premier-party-cruises',
  name: 'Premier Party Cruises',
  tagline: 'Lake Travis Party Boat Rentals',
  description:
    "Austin's favorite party boat rentals on Lake Travis. Get free delivery to the marina, easy group ordering, and extra perks for your boat party.",
  heroVideoUrl: 'https://www.youtube.com/watch?v=4-Yx24Y6oro',
  heroVideoId: '4-Yx24Y6oro',
  heroImageUrl: '/images/partners/premierpartycruises-hero.webp',
  bulletPoints: [
    {
      text: 'Free delivery to Premier Party Cruises marina and cooler stocking',
      icon: 'delivery',
    },
    {
      text: 'Easy Group Ordering',
      icon: 'group',
    },
    {
      text: 'Plus extra perks delivered to your local spot!',
      icon: 'perks',
    },
  ],
  priceIndicator: '$',
  websiteUrl: 'https://premierpartycruises.com',
  orderTypes: [
    {
      id: 'boat',
      label: 'Start a Boat Order',
      description: 'Order drinks for your Premier Party Cruises boat party',
      icon: 'anchor',
    },
    {
      id: 'airbnb',
      label: 'Start an Airbnb Order',
      description: 'Order drinks delivered to your rental property',
      icon: 'home',
    },
  ],
  faqs: [
    {
      question: 'How does delivery work?',
      answer:
        "We deliver directly to the Premier Party Cruises marina at Lake Travis. Just place your order and we'll have your drinks ready and waiting when you arrive. We can even stock your coolers for you!",
    },
    {
      question: 'How many drinks do I need?',
      answer:
        "Use our drink calculator to estimate the perfect amount for your group. A good rule of thumb is 2-3 drinks per person per hour for a typical boat party.",
      link: {
        text: 'Use Drink Calculator',
        url: '#drink-calculator',
        external: false,
      },
    },
    {
      question: 'Still need to book a boat party?',
      answer:
        "Premier Party Cruises offers private boat rentals on Lake Travis for groups of 5-75 people. They've been Austin's favorite for 15+ years!",
      link: {
        text: "Visit Premier Party Cruises' Website",
        url: 'https://premierpartycruises.com',
        external: true,
      },
    },
    {
      question: "What's included in the service?",
      answer:
        'We provide alcohol delivery, ice, cooler stocking, and mixers. Just tell us what you need and we handle the rest so you can focus on having fun on the lake.',
    },
    {
      question: 'Can I order for a group?',
      answer:
        "Absolutely! Our group ordering feature lets everyone contribute to one order. The host creates an order, shares the link, and friends can add their drinks. When you're ready, checkout with one combined delivery.",
    },
  ],
  logoUrl: '/images/partners/premierpartycruises-logo.webp',
  serviceArea: 'Lake Travis, Austin TX',
  isActive: true,
};

/**
 * All partner landing pages
 * Add new partners to this array
 */
export const partnerLandingPages: PartnerLandingPage[] = [premierPartyCruises];

/**
 * Get partner landing page by slug
 */
export function getPartnerLandingPage(
  slug: string
): PartnerLandingPage | undefined {
  return partnerLandingPages.find((p) => p.slug === slug);
}

/**
 * Get all active partner landing pages
 */
export function getActivePartnerLandingPages(): PartnerLandingPage[] {
  return partnerLandingPages.filter((p) => p.isActive);
}
