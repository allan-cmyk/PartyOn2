import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lynn\'s Lodging Partnership | Party On Delivery Austin',
  description: 'Exclusive partnership with Lynn\'s Lodging for alcohol delivery to Lake Travis vacation rentals. Premium service for your guests.',
  keywords: 'lynns lodging austin, lake travis vacation rentals, vacation rental alcohol delivery, lake travis lodging',
  alternates: {
    canonical: '/partners/lynns-lodging',
  },
  openGraph: {
    title: 'Lynn\'s Lodging Partnership - Party On Delivery Austin',
    description: 'Exclusive alcohol delivery partnership for Lake Travis vacation rentals.',
    url: 'https://partyondelivery.com/partners/lynns-lodging',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LynnsLodgingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
