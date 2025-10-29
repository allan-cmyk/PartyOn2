import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bachelorette Party Products | Party On Delivery Austin',
  description: 'Shop premium spirits, champagne, and cocktail supplies for your Austin bachelorette party. Delivered cold to hotels, Airbnbs, and party venues.',
  keywords: 'bachelorette party products austin, bach party alcohol, champagne delivery austin, party supplies',
  alternates: {
    canonical: '/bach-parties/products',
  },
  openGraph: {
    title: 'Bachelorette Party Products - Party On Delivery Austin',
    description: 'Browse our curated selection of alcohol and party supplies for your Austin bach party.',
    url: 'https://partyondelivery.com/bach-parties/products',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BachPartiesProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
