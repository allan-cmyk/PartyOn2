import type { ReactElement, ReactNode } from 'react';
import type { Metadata } from 'next';
import venuesData from '@/data/byob-venues.json';
import type { BYOBVenue } from '@/lib/byob-venues/types';
import { getAreaName } from '@/lib/byob-venues/types';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const venues = venuesData.venues as BYOBVenue[];
  const venue = venues.find((v) => v.partnerSlug === slug);

  if (!venue) {
    return {
      title: 'Venue Not Found | Party On Delivery',
      description: 'This venue page does not exist.',
    };
  }

  const areaName = getAreaName(venue.area);
  const title = `${venue.name} | Free Alcohol Delivery | Party On Delivery`;
  const description = `Order alcohol for your event at ${venue.name} in ${areaName}. Free delivery to this BYOB venue. ${venue.byobPolicy}`;

  return {
    title,
    description,
    keywords: [
      venue.name,
      `${venue.name} BYOB`,
      `${venue.name} alcohol delivery`,
      `${areaName} BYOB venues`,
      `Austin ${venue.subcategory}`,
      'free alcohol delivery Austin',
      'BYOB wedding venue Austin',
    ],
    openGraph: {
      title: `${venue.name} | Free Alcohol Delivery`,
      description,
      url: `https://partyondelivery.com/venues/${slug}`,
      siteName: 'Party On Delivery',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: venue.image || '/images/venues/default-venue.webp',
          width: 1200,
          height: 630,
          alt: `${venue.name} - ${venue.subcategory} in ${areaName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${venue.name} | Free Alcohol Delivery`,
      description,
      images: [venue.image || '/images/venues/default-venue.webp'],
    },
    alternates: {
      canonical: `https://partyondelivery.com/venues/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const venues = venuesData.venues as BYOBVenue[];
  return venues
    .filter((v) => v.partnerSlug)
    .map((v) => ({
      slug: v.partnerSlug,
    }));
}

export default function VenueLayout({ children }: LayoutProps): ReactElement {
  return <>{children}</>;
}
