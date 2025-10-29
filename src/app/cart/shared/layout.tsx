import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Group Order Cart | Party On Delivery Austin',
  description: 'Create and share group alcohol orders with friends. Split costs, reach minimums together, and enjoy premium delivery in Austin, Texas.',
  keywords: 'group alcohol order Austin, shared cart, split alcohol order, group delivery, party alcohol order',
  alternates: {
    canonical: '/cart/shared',
  },
  openGraph: {
    title: 'Group Order Cart | Party On Delivery Austin',
    description: 'Create and share group alcohol orders with friends in Austin.',
    url: 'https://partyondelivery.com/cart/shared',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SharedCartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
