import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alcohol Delivery | Party On Delivery Austin',
  description: 'Premium alcohol delivery in Austin, TX. Same-day and scheduled delivery of spirits, wine, beer, and cocktail ingredients to your neighborhood.',
  keywords: 'alcohol delivery Austin, liquor delivery, wine delivery, beer delivery, spirits delivery, same-day alcohol delivery',
  alternates: {
    canonical: '/delivery-areas',
  },
  openGraph: {
    title: 'Alcohol Delivery | Party On Delivery Austin',
    description: 'Premium alcohol delivery in Austin. Same-day and scheduled delivery to your neighborhood.',
    url: 'https://partyondelivery.com/delivery-areas',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DeliveryLocationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
