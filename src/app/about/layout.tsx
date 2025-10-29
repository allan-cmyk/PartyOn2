import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Party On Delivery | Austin Alcohol Delivery Service',
  description: 'Learn about Austin\'s premier alcohol delivery service. TABC-licensed, fully insured, and trusted for weddings, events, and celebrations since 2020.',
  keywords: 'about party on delivery, austin alcohol delivery, licensed alcohol delivery, event alcohol service austin',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Party On Delivery - Austin Alcohol Delivery',
    description: 'Austin\'s premier alcohol delivery service for weddings, events, and celebrations.',
    url: 'https://partyondelivery.com/about',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
