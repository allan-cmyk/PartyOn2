import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Connected Austin - Bachelor Party Drink Delivery | Party On Delivery',
  description:
    'Get alcohol delivered to your Austin rental or Airbnb for your bachelor party weekend. Beer, wine, spirits, and mixers with free delivery, easy group ordering, and cooler stocking.',
  openGraph: {
    title: 'Connected Austin - Bachelor Party Drink Delivery',
    description:
      "Planning a bachelor party in Austin? Get your drinks delivered and stocked before the crew arrives. Free delivery, group ordering, and cooler stocking included.",
    images: [
      {
        url: '/images/partners/connectedaustin-hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Connected Austin bachelor party drink delivery in Austin, TX',
      },
    ],
  },
  keywords: [
    'Connected Austin drink delivery',
    'Austin bachelor party drinks',
    'bachelor party alcohol delivery Austin',
    'Austin Airbnb drink delivery',
    'bachelor party group order',
    'Austin bachelor weekend drinks',
  ],
};

interface LayoutProps {
  children: ReactNode;
}

export default function ConnectedAustinLayout({
  children,
}: LayoutProps): ReactElement {
  return <>{children}</>;
}
