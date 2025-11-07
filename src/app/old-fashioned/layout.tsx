import LuxuryNavigation from '@/components/LuxuryNavigation';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Old Fashioned Delivery Austin - Premium Bourbon',
  description: 'Premium bourbon, rye whiskey, bitters, and Old Fashioned essentials delivered to your door in Austin. Classic cocktail ingredients from top distilleries.',
  keywords: 'Old Fashioned delivery Austin, bourbon delivery, rye whiskey delivery, whiskey cocktail ingredients, premium spirits Austin',
  alternates: {
    canonical: '/old-fashioned',
  },
  openGraph: {
    title: 'Old Fashioned Delivery | Party On Delivery Austin',
    description: 'Premium bourbon and rye whiskey for perfect Old Fashioneds delivered in Austin.',
    url: 'https://partyondelivery.com/old-fashioned',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500']
});

export default function LuxuryRitzLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${cormorant.variable} ${inter.variable} font-sans`}>
      <LuxuryNavigation variant="minimal" />
      {children}
    </div>
  );
}