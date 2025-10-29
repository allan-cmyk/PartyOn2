import LuxuryNavigation from '@/components/LuxuryNavigation';
import { Oswald, Inter } from 'next/font/google';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aperol Spritz Delivery | Premium Cocktail Ingredients | Party On Delivery Austin',
  description: 'Get Aperol, prosecco, and everything you need for perfect Aperol Spritz cocktails delivered to your door in Austin. Premium ingredients with fast delivery.',
  keywords: 'Aperol Spritz delivery Austin, Aperol delivery, prosecco delivery, cocktail ingredients Austin, Italian aperitif delivery',
  alternates: {
    canonical: '/aperol-spritz',
  },
  openGraph: {
    title: 'Aperol Spritz Delivery | Party On Delivery Austin',
    description: 'Get Aperol, prosecco, and ingredients for perfect Aperol Spritz delivered in Austin.',
    url: 'https://partyondelivery.com/aperol-spritz',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-oswald',
  weight: ['300', '400', '500', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700']
});

export default function LuxuryPrabalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${oswald.variable} ${inter.variable} font-sans`}>
      <LuxuryNavigation variant="hidden" />
      {children}
    </div>
  );
}