import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed | Party On Delivery Austin',
  description: 'Your premium alcohol delivery order is confirmed! Track your order status, view delivery details, and contact our team for any questions.',
  keywords: 'order confirmation, alcohol delivery confirmed, order tracking Austin, delivery status, order receipt',
  alternates: {
    canonical: '/checkout/success',
  },
  openGraph: {
    title: 'Order Confirmed | Party On Delivery Austin',
    description: 'Your premium alcohol delivery order is confirmed! Track your order and view delivery details.',
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
