import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vacation Rental Partner Program | Party On Delivery Austin',
  description: 'TABC-licensed alcohol delivery, signature craft cocktails, bartender coordination, and full bar setup for Austin\'s premium short-term rentals. Turnkey for guests, hands-off for your team.',
  keywords: 'vacation rental partner austin, str alcohol delivery, airbnb concierge austin, vrbo property manager, lake travis vacation rental bar service, tabc licensed delivery',
  alternates: {
    canonical: '/partners/vacation-rentals',
  },
  openGraph: {
    title: 'The bar program your luxury rentals have been missing | Party On Delivery',
    description: 'TABC-licensed alcohol delivery and full bar service for Austin\'s premium short-term rentals.',
    url: 'https://partyondelivery.com/partners/vacation-rentals',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function VacationRentalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
