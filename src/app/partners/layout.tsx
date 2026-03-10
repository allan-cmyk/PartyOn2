import { Metadata } from 'next';
import Script from 'next/script';
import partnersData from '@/data/austin-partners.json';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Best Austin Event Vendors 2026 | Wedding, Party & Corporate | Party On Delivery',
  description:
    "Discover Austin's best event vendors - top-rated wedding planners, Lake Travis boat rentals, mobile bartenders, caterers, venues & party services. Your complete guide to planning unforgettable Austin events.",
  keywords:
    'austin event vendors, best austin wedding vendors, austin party vendors, lake travis boat rentals, austin mobile bartenders, austin wedding planners, austin catering services, austin event venues, austin bachelorette party vendors, things to do in austin for parties, best of austin vendors, austin corporate event vendors, austin party planning, TABC certified bartenders austin, austin hill country venues, downtown austin event vendors, austin event services',
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'Best Austin Event Vendors & Party Services 2026 | Party On Delivery',
    description:
      "Austin's top-rated event vendors: wedding planners, Lake Travis boats, mobile bartenders, caterers & venues. Plan your perfect Austin event.",
    url: 'https://partyondelivery.com/partners',
    type: 'website',
    images: [
      {
        url: '/images/hero/austin-skyline-golden-hour.webp',
        width: 1200,
        height: 630,
        alt: 'Best Austin Event Vendors - Wedding, Party & Corporate Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Austin Event Vendors & Party Services 2026',
    description:
      "Austin's top-rated event vendors: wedding planners, Lake Travis boats, mobile bartenders, caterers & venues.",
    images: ['/images/hero/austin-skyline-golden-hour.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function generatePartnersStructuredData() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Partners', url: '/partners' },
  ]);

  // ItemList schema for the partners directory
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Austin Event Vendors 2026',
    description:
      'Directory of the best Austin event vendors including wedding planners, Lake Travis boat rentals, mobile bartenders, caterers, venues, and party services',
    numberOfItems: partnersData.partners.length,
    itemListElement: partnersData.partners.map((partner, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: partner.name,
        description: partner.description,
        url: partner.website,
        image: `https://partyondelivery.com${partner.logo}`,
        areaServed: {
          '@type': 'City',
          name: 'Austin',
          '@id': 'https://en.wikipedia.org/wiki/Austin,_Texas',
        },
      },
    })),
  };

  // CollectionPage schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Best Austin Event Vendors Directory',
    description:
      "Discover Austin's best event vendors - top wedding planners, Lake Travis boat rentals, mobile bartenders, caterers, venues and party services for 2026.",
    url: 'https://partyondelivery.com/partners',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Best Austin Event Vendors',
      numberOfItems: partnersData.partners.length,
    },
    about: {
      '@type': 'Thing',
      name: 'Austin Event Planning and Party Services',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Party On Delivery',
      url: 'https://partyondelivery.com',
    },
    keywords: 'austin event vendors, best austin wedding vendors, lake travis boat rentals, austin mobile bartenders, austin catering, austin venues',
  };

  // FAQ schema for rich snippets
  const faqSchema = generateFAQSchema([
    {
      question: 'What are the best event vendors in Austin?',
      answer: "Austin's best event vendors include experienced wedding planners, TABC-certified mobile bartenders, Lake Travis boat rental companies, professional caterers, and unique venue spaces. Our directory features vetted partners across all categories to help you plan the perfect Austin event.",
    },
    {
      question: 'How do I find wedding vendors in Austin, TX?',
      answer: 'Browse our Austin vendor directory to find top-rated wedding planners, caterers, bartenders, and venues. Each partner has been selected for their quality of service and experience with Austin weddings, from downtown celebrations to Hill Country estates.',
    },
    {
      question: 'Where can I rent a party boat on Lake Travis?',
      answer: 'Our boat rental partners offer a variety of Lake Travis party boats, including double-decker boats with water slides, luxury yachts, and pontoon boats perfect for bachelorette parties, birthdays, and corporate outings. Most boats include captains and can accommodate groups from 8 to 25+ guests.',
    },
    {
      question: 'Do I need a TABC-certified bartender for my Austin event?',
      answer: 'Yes, Texas law requires bartenders serving alcohol at events to be TABC-certified. Our mobile bartending partners are fully licensed and insured, ensuring your event is compliant while providing professional cocktail service for your guests.',
    },
  ]);

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbSchema, itemListSchema, collectionPageSchema, faqSchema],
  };
}

export default function AustinPartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = generatePartnersStructuredData();

  return (
    <>
      <Script
        id="austin-partners-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
