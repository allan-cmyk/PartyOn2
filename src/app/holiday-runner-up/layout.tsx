import { Metadata } from 'next';
import { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'Holiday Runner-Up Gift – Free Delivery & Gifts | Party On Delivery Austin',
  description:
    "Entered our Holiday Cocktail Kit Giveaway? Get a free mini Espresso Martini bottle, holiday gift package, and free delivery on your $250+ holiday party order in Austin. Claim your runner-up gift today with Party On Delivery.",
  keywords:
    'holiday party austin, corporate holiday gifts, espresso martini kit, austin alcohol delivery, holiday gift package, party on delivery',
  alternates: {
    canonical: '/holiday-runner-up',
  },
  openGraph: {
    title: 'Holiday Runner-Up Gift – Free Delivery & Gifts | Party On Delivery',
    description:
      'Exclusive runner-up offer: Free mini Espresso Martini, holiday gift package, and free delivery on $250+ orders in Austin.',
    url: 'https://partyondelivery.com/holiday-runner-up',
    type: 'website',
    siteName: 'Party On Delivery',
    images: [
      {
        url: '/images/hero/corporate-hero-gala.webp',
        width: 1200,
        height: 630,
        alt: 'Holiday Runner-Up Package - Party On Delivery Austin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holiday Runner-Up Gift – Free Delivery & Gifts',
    description:
      'Exclusive runner-up offer: Free mini Espresso Martini, holiday gift package, and free delivery on $250+ orders.',
    images: ['/images/hero/corporate-hero-gala.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function HolidayRunnerUpLayout({
  children,
}: LayoutProps): ReactElement {
  return <>{children}</>;
}
