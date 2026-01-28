import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thank You! | Party On Delivery Austin',
  description: 'Thank you for your order! Your premium alcohol delivery is confirmed. Track your order status, view delivery details, and contact our team for any questions.',
  keywords: 'thank you, order confirmation, alcohol delivery confirmed, order tracking Austin, delivery status',
  alternates: {
    canonical: '/checkout/success',
  },
  openGraph: {
    title: 'Thank You! | Party On Delivery Austin',
    description: 'Thank you for your order! Your premium alcohol delivery is confirmed. Track your order and view delivery details.',
    url: 'https://partyondelivery.com/checkout/success',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
