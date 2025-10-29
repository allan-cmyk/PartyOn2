import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Event Planning & Cocktail Tips | Party On Delivery Austin',
  description: 'Expert advice on event planning, cocktail recipes, party hosting, and alcohol selection. Tips for weddings, bachelorette parties, corporate events, and more in Austin.',
  keywords: 'event planning blog Austin, cocktail recipes, party planning tips, bachelorette party ideas, wedding alcohol planning, corporate event tips',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Event Planning & Cocktail Tips | Party On Delivery',
    description: 'Expert advice on event planning, cocktail recipes, and party hosting in Austin.',
    url: 'https://partyondelivery.com/blog',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
