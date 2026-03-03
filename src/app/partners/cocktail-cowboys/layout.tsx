import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Cocktail Cowboys - Party Hosting & Drink Delivery | Party On Delivery',
  description:
    'Book Cocktail Cowboys for your Austin bachelorette party and get drinks delivered to your rental. Professional party hosts + bartenders paired with hassle-free alcohol delivery. As seen on Shark Tank.',
  openGraph: {
    title: 'Cocktail Cowboys + Party On Delivery',
    description:
      'Austin\'s #1 bachelorette party hosts meet Austin\'s easiest drink delivery. Book Cocktail Cowboys and get your drinks delivered before the party starts.',
    images: [
      {
        url: '/images/partners/cocktailcowboys-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Cocktail Cowboys party hosting in Austin - bachelorette parties',
      },
    ],
  },
  keywords: [
    'Cocktail Cowboys Austin',
    'Austin bachelorette party hosts',
    'Party Host Boys Austin',
    'bachelorette party bartender Austin',
    'Austin party hosting service',
    'drink delivery Austin bachelorette',
  ],
};

interface LayoutProps {
  children: ReactNode;
}

export default function CocktailCowboysLayout({
  children,
}: LayoutProps): ReactElement {
  return <>{children}</>;
}
