import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotel & Resort Partner Program | Party On Delivery Austin',
  description: 'Partner with Party On Delivery for seamless alcohol delivery to your hotel or resort guests. Concierge integration, guest services, and premium beverage programs.',
  keywords: 'hotel alcohol delivery austin, resort partner program, hotel concierge services, guest beverage service austin',
  alternates: {
    canonical: '/partners/hotels-resorts',
  },
  openGraph: {
    title: 'Hotel & Resort Partners - Party On Delivery Austin',
    description: 'Seamless alcohol delivery integration for hotel and resort guests in Austin.',
    url: 'https://partyondelivery.com/partners/hotels-resorts',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HotelsResortsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
