import type { ReactElement, ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Bar Packages Austin | Build Your Wedding Bar Order',
  description:
    'Build your perfect wedding bar order with our easy calculator. Choose from 5 package tiers, from budget-friendly to premium. Calculate quantities based on your guest count and get your order delivered in Austin.',
  keywords: [
    'wedding bar packages austin',
    'wedding alcohol calculator',
    'austin wedding bar',
    'wedding drink calculator',
    'wedding bar order',
    'austin wedding alcohol delivery',
    'wedding reception bar',
    'texas wedding bar service',
  ],
  openGraph: {
    title: 'Wedding Bar Packages | Party On Delivery Austin',
    description:
      'Build your perfect wedding bar in minutes. 5 package tiers from $13-$26 per person. Calculate exactly what you need for your Austin wedding.',
    url: 'https://partyondelivery.com/weddings/order',
    siteName: 'Party On Delivery',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/weddings/wedding-bar-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Wedding Bar Packages - Party On Delivery Austin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding Bar Packages | Party On Delivery Austin',
    description:
      'Build your perfect wedding bar in minutes. 5 package tiers from $13-$26 per person.',
    images: ['/images/weddings/wedding-bar-hero.jpg'],
  },
  alternates: {
    canonical: 'https://partyondelivery.com/weddings/order',
  },
};

interface LayoutProps {
  children: ReactNode;
}

export default function WeddingOrderLayout({ children }: LayoutProps): ReactElement {
  return <>{children}</>;
}
