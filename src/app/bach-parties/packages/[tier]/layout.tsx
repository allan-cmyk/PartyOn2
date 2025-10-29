import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ tier: string }> }): Promise<Metadata> {
  const { tier } = await params;

  const tierTitles: Record<string, string> = {
    'classic': 'Classic Package',
    'premium': 'Premium Package',
    'ultra': 'Ultra Package',
  }

  const tierDescriptions: Record<string, string> = {
    'classic': 'Essential alcohol package for bachelorette parties. Premium spirits, mixers, and ice delivered to your Austin celebration.',
    'premium': 'Elevated bachelorette party package with top-shelf spirits, signature cocktails, and full bar service.',
    'ultra': 'Luxury bachelorette package with premium champagne, craft cocktails, and VIP bar service for Austin celebrations.',
  }

  const title = tierTitles[tier] || 'Party Package'
  const description = tierDescriptions[tier] || 'Premium alcohol delivery package for your bachelorette party in Austin.'

  return {
    title: `${title} - Bachelorette Party | Party On Delivery Austin`,
    description,
    keywords: `bachelorette party ${tier} package, bach party alcohol delivery austin, ${tier} bar package`,
    alternates: {
      canonical: `/bach-parties/packages/${tier}`,
    },
    openGraph: {
      title: `${title} - Bachelorette Party Delivery`,
      description,
      url: `https://partyondelivery.com/bach-parties/packages/${tier}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function BachPartiesPackageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
