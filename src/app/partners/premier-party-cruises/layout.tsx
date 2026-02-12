import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Free Drink Delivery to Your Cruise | Party On Delivery',
  description:
    'We deliver beer, wine, liquor, ice & coolers straight to the dock for your Premier Party Cruise on Lake Travis. Fully stocked and ready when you board.',
  openGraph: {
    title: 'Free Drink Delivery to Your Cruise | Party On Delivery',
    description:
      'We deliver beer, wine, liquor, ice & coolers straight to the dock for your Premier Party Cruise on Lake Travis. Fully stocked and ready when you board.',
    images: [
      {
        url: 'https://partyondelivery.com/images/partners/premier-preview.jpg',
        width: 1200,
        height: 630,
      },
    ],
    url: 'https://partyondelivery.com/partners/premier-party-cruises',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Drink Delivery to Your Cruise | Party On Delivery',
    description:
      'We deliver beer, wine, liquor, ice & coolers straight to the dock for your Premier Party Cruise on Lake Travis. Fully stocked and ready when you board.',
    images: ['https://partyondelivery.com/images/partners/premier-preview.jpg'],
  },
  keywords: [
    'Premier Party Cruises alcohol delivery',
    'Lake Travis boat party drinks',
    'Austin party boat alcohol',
    'BYOB boat party Lake Travis',
    'beer delivery Lake Travis',
  ],
};

interface LayoutProps {
  children: ReactNode;
}

export default function PremierPartyCruisesLayout({
  children,
}: LayoutProps): ReactElement {
  return <>{children}</>;
}
