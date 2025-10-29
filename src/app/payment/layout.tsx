import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Payment | Party On Delivery Austin',
  description: 'Complete your payment securely for premium alcohol delivery. We accept all major credit cards with fast, encrypted processing.',
  keywords: 'alcohol delivery payment, secure payment Austin, pay for alcohol delivery, online payment, credit card payment',
  alternates: {
    canonical: '/payment',
  },
  openGraph: {
    title: 'Secure Payment | Party On Delivery Austin',
    description: 'Complete your payment securely for premium alcohol delivery.',
    url: 'https://partyondelivery.com/payment',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
