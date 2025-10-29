import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ tier: string }> }): Promise<Metadata> {
  const { tier } = await params;

  const tierTitles: Record<string, string> = {
    'classic': 'Classic Package',
    'premium': 'Premium Package',
    'ultra': 'Ultra Package',
  }

  const tierDescriptions: Record<string, string> = {
    'classic': 'Essential bar service for Austin weddings. Premium spirits, wine, champagne, and professional setup.',
    'premium': 'Elevated wedding bar package with top-shelf spirits, signature cocktails, and TABC-certified bartenders.',
    'ultra': 'Luxury wedding bar service with premium champagne, craft cocktails, and full VIP bar service for your special day.',
  }

  const title = tierTitles[tier] || 'Wedding Package'
  const description = tierDescriptions[tier] || 'Premium bar service package for your Austin wedding.'

  return {
    title: `${title} - Wedding Bar Service | Party On Delivery Austin`,
    description,
    keywords: `wedding bar service ${tier} package, austin wedding bartender, ${tier} wedding bar`,
    alternates: {
      canonical: `/weddings/packages/${tier}`,
    },
    openGraph: {
      title: `${title} - Austin Wedding Bar Service`,
      description,
      url: `https://partyondelivery.com/weddings/packages/${tier}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function WeddingsPackageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
