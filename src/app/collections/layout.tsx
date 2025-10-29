import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Collections | Premium Spirits, Wine & Beer | Party On Delivery Austin',
  description: 'Browse our curated collections of premium spirits, wines, craft beers, and cocktail ingredients. Same-day and scheduled alcohol delivery in Austin, Texas.',
  keywords: 'alcohol collections Austin, premium spirits collection, wine collections, craft beer Austin, cocktail ingredients, liquor delivery collections',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    title: 'Shop Collections | Premium Spirits, Wine & Beer | Party On Delivery',
    description: 'Browse curated collections of premium alcohol. Same-day and scheduled delivery in Austin.',
    url: 'https://partyondelivery.com/collections',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
