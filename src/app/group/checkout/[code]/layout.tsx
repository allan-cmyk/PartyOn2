import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Group Order Checkout | Party On Delivery Austin',
  description: 'Complete your group alcohol order checkout. Review all participants and finalize delivery details in Austin, Texas.',
  keywords: 'group order checkout Austin, finalize group order, group delivery payment',
  alternates: {
    canonical: '/group',
  },
  openGraph: {
    title: 'Group Order Checkout | Party On Delivery Austin',
    description: 'Complete your group alcohol order checkout.',
    url: 'https://partyondelivery.com/group',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function GroupCheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
