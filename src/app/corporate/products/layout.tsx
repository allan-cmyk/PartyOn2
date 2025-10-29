import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corporate Event Products | Party On Delivery Austin',
  description: 'Shop alcohol and bar supplies for Austin corporate events. Professional delivery of beer, wine, spirits, mixers, and ice to offices and venues.',
  keywords: 'corporate event products austin, office party alcohol, business event bar supplies, company party delivery',
  alternates: {
    canonical: '/corporate/products',
  },
  openGraph: {
    title: 'Corporate Event Products - Party On Delivery Austin',
    description: 'Browse our selection of alcohol and bar supplies for professional events in Austin.',
    url: 'https://partyondelivery.com/corporate/products',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CorporateProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
