import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout | Party On Delivery Austin',
  description: 'Complete your premium alcohol delivery order with secure checkout. Fast processing, flexible delivery scheduling, and exceptional service in Austin, Texas.',
  keywords: 'alcohol delivery checkout, order alcohol online Austin, premium spirits delivery, wine delivery checkout, beer delivery Austin, secure payment',
  alternates: {
    canonical: '/checkout',
  },
  openGraph: {
    title: 'Secure Checkout | Party On Delivery Austin',
    description: 'Complete your premium alcohol delivery order with secure checkout. Fast processing and flexible delivery scheduling in Austin.',
    url: 'https://partyondelivery.com/checkout',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
