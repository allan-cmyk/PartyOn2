import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join Group Order | Party On Delivery Austin',
  description: 'Join a group alcohol order with your friends. Add your items and split the delivery cost in Austin, Texas.',
  keywords: 'join group order Austin, group alcohol delivery, shared order, split delivery cost',
  alternates: {
    canonical: '/group',
  },
  openGraph: {
    title: 'Join Group Order | Party On Delivery Austin',
    description: 'Join a group alcohol order and split the delivery cost.',
    url: 'https://partyondelivery.com/group',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function GroupCodeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
