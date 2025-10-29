import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Party On Delivery Austin',
  description: 'Get in touch with Party On Delivery for alcohol delivery in Austin. Call (737) 371-9700 or submit an inquiry for weddings, events, and celebrations.',
  keywords: 'contact party on delivery, austin alcohol delivery contact, event inquiry austin, party delivery phone',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Party On Delivery - Austin Alcohol Delivery',
    description: 'Get in touch for alcohol delivery in Austin. Call (737) 371-9700 or submit an inquiry.',
    url: 'https://partyondelivery.com/contact',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
