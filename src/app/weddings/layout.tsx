import { Metadata } from 'next'
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas'

export const metadata: Metadata = {
  title: 'Wedding Bar Service Austin - Alcohol Delivery',
  description: 'Elegant bar service for Austin weddings. Premium spirits, signature cocktails, champagne service, and TABC-certified bartenders for your special day.',
  keywords: 'wedding bar service austin, wedding alcohol delivery, austin wedding bartender, lake travis wedding bar, wedding cocktails austin, wedding champagne service',
  alternates: {
    canonical: '/weddings',
  },
  openGraph: {
    title: 'Wedding Bar Service - Party On Delivery Austin',
    description: 'Make your wedding unforgettable with premium bar service. Full-service packages for Austin weddings.',
    url: 'https://partyondelivery.com/weddings',
    type: 'website',
    images: [
      {
        url: '/images/weddings/elegant-wedding-bar.webp',
        width: 1200,
        height: 630,
        alt: 'Wedding Bar Service Austin - Party On Delivery',
      },
    ],
  },
}

export default function WeddingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const serviceSchema = generateServiceSchema('wedding')
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Weddings', url: '/weddings' }
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