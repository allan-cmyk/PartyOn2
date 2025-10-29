import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vacation Rental Partnership | Party On Delivery Austin',
  description: 'Enhance your Austin vacation rental with alcohol delivery services. Guest amenities, concierge integration, and seamless ordering for Airbnb and VRBO hosts.',
  keywords: 'vacation rental austin, airbnb alcohol delivery, vrbo guest services, rental property amenities austin',
  alternates: {
    canonical: '/partners/vacation-rentals',
  },
  openGraph: {
    title: 'Vacation Rental Partnership - Party On Delivery Austin',
    description: 'Enhance your vacation rental with alcohol delivery services for guests.',
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
