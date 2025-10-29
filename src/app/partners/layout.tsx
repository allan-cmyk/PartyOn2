import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner Programs | Party On Delivery Austin',
  description: 'Join Party On Delivery\'s partner network. B2B partnerships for hotels, vacation rentals, property managers, and event professionals in Austin.',
  keywords: 'partner program austin, hotel alcohol delivery, vacation rental services, property management alcohol, b2b austin',
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'Partner Programs - Party On Delivery Austin',
    description: 'B2B partnerships for hotels, vacation rentals, property managers, and event professionals.',
    url: 'https://partyondelivery.com/partners',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
