import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corporate Events Guide | Professional Alcohol Service | Party On Delivery Austin',
  description: 'Complete guide to planning alcohol service for corporate events in Austin. Expert tips for team building, client entertainment, and professional gatherings.',
  keywords: 'corporate event alcohol Austin, business event planning, corporate party alcohol, professional event alcohol, team building drinks',
  alternates: {
    canonical: '/corporate-events-guide',
  },
  openGraph: {
    title: 'Corporate Events Guide | Party On Delivery Austin',
    description: 'Complete guide to planning alcohol service for corporate events in Austin.',
    url: 'https://partyondelivery.com/corporate-events-guide',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CorporateEventsGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
