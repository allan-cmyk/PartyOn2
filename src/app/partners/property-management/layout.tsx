import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Management Partnership | Party On Delivery Austin',
  description: 'Add alcohol delivery services for your vacation rental guests. Streamlined ordering, guest convenience, and revenue sharing for property managers.',
  keywords: 'property management austin, vacation rental services, guest amenities austin, rental property alcohol delivery',
  alternates: {
    canonical: '/partners/property-management',
  },
  openGraph: {
    title: 'Property Management Partnership - Party On Delivery Austin',
    description: 'Add alcohol delivery services for your vacation rental guests in Austin.',
    url: 'https://partyondelivery.com/partners/property-management',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PropertyManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
