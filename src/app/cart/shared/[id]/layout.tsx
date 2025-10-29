import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Cart | Party On Delivery Austin',
  description: 'Join a group alcohol order and contribute to reaching the order minimum. Premium delivery service in Austin, Texas.',
  keywords: 'join group order, shared alcohol order, group cart, split delivery Austin',
  alternates: {
    canonical: '/cart/shared',
  },
  openGraph: {
    title: 'Shared Cart | Party On Delivery Austin',
    description: 'Join a group alcohol order in Austin.',
    url: 'https://partyondelivery.com/cart/shared',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function SharedCartIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
