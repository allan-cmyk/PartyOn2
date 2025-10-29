import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Group Order Dashboard | Party On Delivery Austin',
  description: 'Manage your group alcohol order. View participants, track progress toward minimum, and coordinate delivery in Austin, Texas.',
  keywords: 'group order dashboard, manage group order, track group delivery, coordinate alcohol order Austin',
  alternates: {
    canonical: '/group/dashboard',
  },
  openGraph: {
    title: 'Group Order Dashboard | Party On Delivery Austin',
    description: 'Manage your group alcohol order and track progress.',
    url: 'https://partyondelivery.com/group/dashboard',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function GroupDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
