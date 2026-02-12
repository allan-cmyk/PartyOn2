import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Premier Party Cruises - Free Alcohol Delivery | Party On Delivery',
  description:
    'Get free alcohol delivery to Premier Party Cruises on Lake Travis. We deliver beer, wine, spirits, and mixers directly to the marina. Easy group ordering for boat parties.',
  openGraph: {
    title: 'Premier Party Cruises - Free Alcohol Delivery',
    description:
      "Austin's favorite party boat rentals on Lake Travis. Get free delivery to the marina, easy group ordering, and extra perks for your boat party.",
    images: ['/images/partners/premierpartycruises-hero.webp'],
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
