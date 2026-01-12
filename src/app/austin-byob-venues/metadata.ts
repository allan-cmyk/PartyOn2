import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Austin BYOB Venues | 73+ Venues with Free Alcohol Delivery | Party On Delivery',
  description: 'Find 73+ Austin BYOB venues for weddings, corporate events, and celebrations. Partner venues get free alcohol delivery. Browse Hill Country barns, Lake Travis boats, and more.',
  keywords: [
    'Austin BYOB venues',
    'BYOB wedding venues Austin',
    'Austin venues bring your own alcohol',
    'BYOB event spaces Austin TX',
    'Austin wedding venues no corkage fee',
    'Hill Country BYOB venues',
    'Lake Travis party boats BYOB',
    'Austin barn wedding venues BYOB',
    'corporate event venues Austin BYOB',
    'affordable Austin wedding venues',
  ],
  openGraph: {
    title: 'Austin BYOB Venues | Free Alcohol Delivery to Partner Venues',
    description: 'Discover 73+ Austin venues that allow outside alcohol. Perfect for weddings, corporate events, and celebrations. Partner venues get free delivery from Party On Delivery.',
    url: 'https://partyondelivery.com/austin-byob-venues',
    siteName: 'Party On Delivery',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/hero/austin-wedding-venue-outdoor.webp',
        width: 1200,
        height: 630,
        alt: 'Austin BYOB Wedding Venue with elegant outdoor setup',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Austin BYOB Venues | 73+ Venues with Free Alcohol Delivery',
    description: 'Find Austin venues that allow outside alcohol. Partner venues get free delivery.',
    images: ['/images/hero/austin-wedding-venue-outdoor.webp'],
  },
  alternates: {
    canonical: 'https://partyondelivery.com/austin-byob-venues',
  },
  robots: {
    index: true,
    follow: true,
  },
};
