import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Pitch — Party On Delivery',
  description:
    'TABC-licensed alcohol delivery, signature cocktail kits, and bartender coordination — built for luxury short-term rental property managers in Austin.',
  robots: { index: false, follow: false },
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
