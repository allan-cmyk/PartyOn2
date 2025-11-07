import { Metadata } from 'next'

// NOTE: Metadata moved to individual page.tsx files to allow dynamic canonical URLs
// This prevents all blog posts from being canonicalized to /blog (SEO disaster!)
export const metadata: Metadata = {
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
