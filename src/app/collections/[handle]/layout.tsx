import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Collection | Party On Delivery Austin',
  description: 'Browse our curated selection of premium alcohol products. Same-day and scheduled delivery available throughout Austin, Texas.',
  keywords: 'alcohol collection Austin, premium spirits, wine delivery, craft beer, cocktail ingredients, liquor delivery',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    title: 'Shop Collection | Party On Delivery Austin',
    description: 'Browse premium alcohol products with same-day delivery in Austin.',
    url: 'https://partyondelivery.com/collections',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CollectionHandleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
