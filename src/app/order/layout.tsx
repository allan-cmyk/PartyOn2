import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Alcohol Delivery | Party On Delivery Austin',
  description: 'Order premium alcohol delivery for your Austin event. 72-hour advance booking, cold delivery, and full-service options for weddings, parties, and celebrations.',
  keywords: 'order alcohol delivery austin, book party delivery, austin event alcohol, schedule alcohol delivery',
  alternates: {
    canonical: '/order',
  },
  openGraph: {
    title: 'Order Alcohol Delivery - Party On Delivery Austin',
    description: 'Order premium alcohol delivery for your Austin event. 72-hour advance booking available.',
    url: 'https://partyondelivery.com/order',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
