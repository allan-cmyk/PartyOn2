import { Metadata } from 'next'
import { generateEventSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas'

export const metadata: Metadata = {
  title: 'Lake Travis Boat Party Alcohol Delivery | Party On Delivery',
  description: 'Premium alcohol delivery to Lake Travis marinas and boats. Perfect for yacht parties, bachelor parties, and waterfront celebrations. 72-hour advance booking.',
  keywords: 'lake travis boat party, boat alcohol delivery austin, yacht party drinks, marina delivery service, lake travis party supplies, boat bachelor party',
  alternates: {
    canonical: '/boat-parties',
  },
  openGraph: {
    title: 'Lake Travis Boat Party Delivery - Party On Delivery',
    description: 'Premium alcohol delivered to your boat at Lake Travis. Yacht parties, celebrations, and waterfront events.',
    url: 'https://partyondelivery.com/boat-parties',
    type: 'website',
    images: [
      {
        url: '/images/boat-parties/lake-travis-yacht.webp',
        width: 1200,
        height: 630,
        alt: 'Lake Travis Boat Party - Party On Delivery',
      },
    ],
  },
}

export default function BoatPartiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const eventSchema = generateEventSchema('party')
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Boat Parties', url: '/boat-parties' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}