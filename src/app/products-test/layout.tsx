import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products Test - Internal',
  robots: {
    index: false, // DO NOT index this test page
    follow: false,
  },
}

export default function ProductsTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
