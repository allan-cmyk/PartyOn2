import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Now | Schedule Your Delivery | Party On Delivery Austin',
  description: 'Book premium alcohol delivery for your event in Austin. Fast ordering with flexible scheduling for weddings, parties, and corporate events.',
  keywords: 'book alcohol delivery Austin, schedule delivery, order alcohol online, fast booking Austin',
  alternates: {
    canonical: '/book-now',
  },
  openGraph: {
    title: 'Book Now | Party On Delivery Austin',
    description: 'Book premium alcohol delivery for your event in Austin.',
    url: 'https://partyondelivery.com/book-now',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BookNowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
