import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wedding Bar Products | Party On Delivery Austin',
  description: 'Shop premium alcohol and bar supplies for Austin weddings. Champagne, wine, spirits, and cocktail essentials delivered to your venue.',
  keywords: 'wedding bar products austin, wedding alcohol delivery, champagne for weddings, wedding bar supplies',
  alternates: {
    canonical: '/weddings/products',
  },
  openGraph: {
    title: 'Wedding Bar Products - Party On Delivery Austin',
    description: 'Browse our selection of premium alcohol and bar supplies for your Austin wedding.',
    url: 'https://partyondelivery.com/weddings/products',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function WeddingsProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
