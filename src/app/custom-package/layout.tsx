import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Custom Package Builder | Party On Delivery Austin',
  description: 'Build your perfect custom alcohol package for any event. Choose from premium spirits, wines, craft beers, and mixers with flexible delivery scheduling in Austin.',
  keywords: 'custom alcohol package Austin, build your own package, custom liquor delivery, personalized alcohol delivery, event alcohol packages',
  alternates: {
    canonical: '/custom-package',
  },
  openGraph: {
    title: 'Custom Package Builder | Party On Delivery Austin',
    description: 'Build your perfect custom alcohol package with flexible delivery scheduling.',
    url: 'https://partyondelivery.com/custom-package',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CustomPackageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
