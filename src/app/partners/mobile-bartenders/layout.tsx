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
