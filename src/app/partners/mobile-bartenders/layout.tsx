import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mobile Bartender Partnership | Party On Delivery Austin',
  description: 'Partner with Party On Delivery as a mobile bartender. Alcohol supply coordination, event logistics, and premium service support for Austin bartenders.',
  keywords: 'mobile bartender austin, bartender partnership, event bartender supplies, austin bar service',
  alternates: {
    canonical: '/partners/mobile-bartenders',
  },
  openGraph: {
    title: 'Mobile Bartender Partnership - Party On Delivery Austin',
    description: 'Partner with us for alcohol supply coordination and event logistics support.',
    url: 'https://partyondelivery.com/partners/mobile-bartenders',
    type: 'website',
    images: [
      {
        url: 'https://partyondelivery.com/images/hero/mobile-bartender-outdoor-event.webp',
        width: 1200,
        height: 630,
        alt: 'Mobile bartender serving drinks at outdoor Austin event',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile Bartender Partnership - Party On Delivery Austin',
    description: 'Partner with us for alcohol supply coordination and event logistics support.',
    images: ['https://partyondelivery.com/images/hero/mobile-bartender-outdoor-event.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MobileBartendersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
