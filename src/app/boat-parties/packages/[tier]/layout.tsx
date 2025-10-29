import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ tier: string }> }): Promise<Metadata> {
  const { tier } = await params;

  const tierTitles: Record<string, string> = {
    'classic': 'Classic Package',
    'premium': 'Premium Package',
    'ultra': 'Ultra Package',
  }

  const tierDescriptions: Record<string, string> = {
    'classic': 'Essential alcohol package for Lake Travis boat parties. Premium spirits, mixers, and ice delivered to marinas.',
    'premium': 'Elevated boat party package with top-shelf spirits, craft cocktails, and full bar service for your yacht.',
    'ultra': 'Luxury marina package with premium champagne, signature cocktails, and VIP service for Lake Travis celebrations.',
  }

  const title = tierTitles[tier] || 'Party Package'
  const description = tierDescriptions[tier] || 'Premium alcohol delivery package for your Lake Travis boat party.'

  return {
    title: `${title} - Boat Party | Party On Delivery Austin`,
    description,
    keywords: `lake travis boat party ${tier} package, yacht party alcohol delivery, ${tier} marina package`,
    alternates: {
      canonical: `/boat-parties/packages/${tier}`,
    },
    openGraph: {
      title: `${title} - Lake Travis Boat Party Delivery`,
      description,
      url: `https://partyondelivery.com/boat-parties/packages/${tier}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function BoatPartiesPackageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
