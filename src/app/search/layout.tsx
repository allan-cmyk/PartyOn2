import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Products | Party On Delivery Austin',
  description: 'Search our complete selection of premium spirits, wines, craft beers, and cocktail ingredients. Find exactly what you need with fast Austin delivery.',
  keywords: 'search alcohol products, find spirits Austin, search wine delivery, search beer delivery, cocktail ingredients search, liquor search',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search Products | Party On Delivery Austin',
    description: 'Search premium alcohol products with fast Austin delivery.',
    url: 'https://partyondelivery.com/search',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
