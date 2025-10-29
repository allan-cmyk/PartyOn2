import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Austin Delivery Areas | Alcohol Delivery Coverage Map | Party On Delivery',
  description: 'Premium alcohol delivery serving all of Austin, TX. Check if we deliver to your neighborhood - Downtown, South Congress, East Austin, Westlake, and more. View delivery zones and fees.',
  keywords: 'Austin alcohol delivery areas, alcohol delivery Downtown Austin, South Congress liquor delivery, East Austin beer delivery, Westlake wine delivery, delivery zones Austin',
  alternates: {
    canonical: '/delivery-areas',
  },
  openGraph: {
    title: 'Austin Delivery Areas | Party On Delivery Coverage Map',
    description: 'Premium alcohol delivery serving all of Austin. Check if we deliver to your neighborhood.',
    url: 'https://partyondelivery.com/delivery-areas',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DeliveryAreasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
