import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Post | Party On Delivery Austin',
  description: 'Expert tips and advice for event planning, cocktail recipes, and party hosting in Austin, Texas.',
  keywords: 'event planning Austin, cocktail recipes, party tips, bachelorette party, wedding planning, corporate events',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog Post | Party On Delivery Austin',
    description: 'Expert tips and advice for event planning and party hosting in Austin.',
    url: 'https://partyondelivery.com/blog',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
