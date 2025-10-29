import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lake Travis Boat Party Products | Party On Delivery Austin',
  description: 'Shop premium alcohol and party supplies for Lake Travis yacht parties. Marina delivery of spirits, beer, wine, and cocktail essentials.',
  keywords: 'lake travis boat party products, yacht party alcohol, marina delivery austin, boat party supplies',
  alternates: {
    canonical: '/boat-parties/products',
  },
  openGraph: {
    title: 'Boat Party Products - Party On Delivery Austin',
    description: 'Browse our selection of alcohol and party supplies for Lake Travis boat parties.',
    url: 'https://partyondelivery.com/boat-parties/products',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BoatPartiesProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
