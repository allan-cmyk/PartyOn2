import { Metadata } from 'next';
import Script from 'next/script';
import partnersData from '@/data/austin-partners.json';
import { generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Austin Event Partners | Vendors & Services | Party On Delivery',
  description:
    "Discover Austin's best event partners - venues, caterers, mobile bartenders, boat rentals & more. Your complete guide to planning unforgettable Austin events.",
  keywords:
    'austin event vendors, austin wedding vendors, austin party planning, lake travis boat rentals, austin catering, austin mobile bartenders, things to do in austin, austin event planning, austin bachelorette vendors',
  alternates: {
    canonical: '/austin-partners',
  },
  openGraph: {
    title: 'Austin Event Partners Directory | Party On Delivery',
    description:
      "Your complete guide to Austin's best event vendors and services.",
    url: 'https://partyondelivery.com/austin-partners',
    type: 'website',
    images: [
      {
        url: '/images/hero/austin-skyline-golden-hour.webp',
        width: 1200,
        height: 630,
        alt: 'Austin Event Partners - Party On Delivery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Austin Event Partners Directory | Party On Delivery',
    description:
      "Your complete guide to Austin's best event vendors and services.",
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
    { name: 'Austin Partners', url: '/austin-partners' },
  ]);

  // ItemList schema for the partners directory
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Austin Event Partners Directory',
    description:
      'Directory of Austin event vendors, venues, caterers, bartenders, and service providers',
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
    name: 'Austin Event Partners',
    description:
      "Discover Austin's best event partners - venues, caterers, mobile bartenders, boat rentals and more.",
    url: 'https://partyondelivery.com/austin-partners',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Austin Event Vendors',
      numberOfItems: partnersData.partners.length,
    },
    about: {
      '@type': 'Thing',
      name: 'Austin Events and Party Planning',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Party On Delivery',
      url: 'https://partyondelivery.com',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbSchema, itemListSchema, collectionPageSchema],
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
