import Navigation from "@/components/Navigation";
import { Crimson_Text, Inter } from 'next/font/google';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gin Martini Delivery Austin - Premium Spirits',
  description: 'Premium gin, vermouth, and martini essentials delivered to your door in Austin. Craft the perfect martini with top-shelf ingredients.',
  keywords: 'Gin Martini delivery Austin, premium gin delivery, vermouth delivery, martini ingredients Austin, craft cocktail delivery',
  alternates: {
    canonical: '/gin-martini',
  },
  openGraph: {
    title: 'Gin Martini Delivery | Party On Delivery Austin',
    description: 'Premium gin and vermouth for perfect martinis delivered in Austin.',
    url: 'https://partyondelivery.com/gin-martini',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const crimson = Crimson_Text({ 
  subsets: ['latin'],
  variable: '--font-crimson',
  weight: ['400', '600', '700']
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500']
});

export default function LuxuryGoyardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${crimson.variable} ${inter.variable} font-heading`}>
      <Navigation />
      {children}
    </div>
  );
}