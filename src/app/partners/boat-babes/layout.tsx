import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Boat Babes - Free Alcohol Delivery | PartyOn Delivery',
  description:
    'Get free alcohol delivery for your Boat Babes lake party on Lake Austin. We deliver beer, wine, spirits, and mixers directly to the marina. Easy group ordering for boat parties.',
  openGraph: {
    title: 'Boat Babes - Free Alcohol Delivery',
    description:
      "Lake Austin's hottest boat party experience. Get free delivery to the marina, easy group ordering, and your drinks iced and ready before the Babes arrive.",
    images: [
      {
        url: '/images/partners/boatbabes-hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Boat Babes lake party on Lake Austin - Free alcohol delivery',
      },
    ],
  },
  keywords: [
    'Boat Babes alcohol delivery',
    'Lake Austin boat party drinks',
    'Austin boat party alcohol',
    'BYOB boat party Lake Austin',
    'beer delivery Lake Austin',
  ],
};

interface LayoutProps {
  children: ReactNode;
}

export default function BoatBabesLayout({
  children,
}: LayoutProps): ReactElement {
  return <>{children}</>;
}
