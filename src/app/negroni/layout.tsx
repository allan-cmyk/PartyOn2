import LuxuryNavigation from '@/components/LuxuryNavigation';
import { Montserrat, Playfair_Display } from 'next/font/google';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Negroni Delivery Austin - Campari & Gin',
  description: 'Get Campari, gin, sweet vermouth, and everything for perfect Negroni cocktails delivered in Austin. Premium Italian cocktail ingredients.',
  keywords: 'Negroni delivery Austin, Campari delivery, Italian cocktail delivery, Negroni ingredients Austin, premium cocktail delivery',
  alternates: {
    canonical: '/negroni',
  },
  openGraph: {
    title: 'Negroni Delivery | Party On Delivery Austin',
    description: 'Get Campari, gin, and sweet vermouth for perfect Negronis delivered in Austin.',
    url: 'https://partyondelivery.com/negroni',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500']
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function LuxuryJimmyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.variable} ${playfair.variable} font-sans`}>
      <LuxuryNavigation variant="minimal" />
      {children}
    </div>
  );
}