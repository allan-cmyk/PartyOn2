import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Category | Party On Delivery Austin',
  description: 'Browse articles about event planning, cocktails, and party hosting in Austin, Texas.',
  keywords: 'event planning blog, cocktail tips, party planning, Austin events',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog Category | Party On Delivery Austin',
    description: 'Browse articles about event planning and party hosting in Austin.',
    url: 'https://partyondelivery.com/blog',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogCategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
