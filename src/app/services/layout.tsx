import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Event Services | Party On Delivery Austin',
  description: 'Premium alcohol delivery services for Austin weddings, boat parties, bachelorette parties, and corporate events. TABC-licensed and fully insured.',
  keywords: 'austin event services, party alcohol delivery, wedding bar service austin, event catering alcohol',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Event Services - Party On Delivery Austin',
    description: 'Premium alcohol delivery for Austin weddings, boat parties, bachelorette parties, and corporate events.',
    url: 'https://partyondelivery.com/services',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
