import { Metadata } from 'next'
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas'

export const metadata: Metadata = {
  title: 'Austin Bachelorette Party Alcohol Delivery',
  description: 'Premium alcohol delivery for Austin bachelorette parties. Signature cocktails, champagne, party packages delivered to hotels, Airbnbs, and party venues.',
  keywords: 'austin bachelorette party, bach party alcohol delivery, bachelorette party drinks austin, party supplies delivery, bach weekend austin',
  alternates: {
    canonical: '/bach-parties',
  },
  openGraph: {
    title: 'Bachelorette Party Delivery - Party On Delivery Austin',
    description: 'Make your bach party unforgettable with premium alcohol delivery. Packages for every celebration.',
    url: 'https://partyondelivery.com/bach-parties',
    type: 'website',
    images: [
      {
        url: '/images/services/bach-parties/bachelorette-champagne-tower.webp',
        width: 1200,
        height: 630,
        alt: 'Bachelorette Party Delivery Austin - Party On Delivery',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BachPartiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const serviceSchema = generateServiceSchema('party')
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Bachelorette Parties', url: '/bach-parties' }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}
