import { Metadata } from 'next'
import OldFashionedNavigation from "@/components/OldFashionedNavigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Premium Spirits & Wine Collection | Party On Delivery Austin',
  description: 'Shop our curated collection of premium spirits, wine, champagne, craft beer, and seltzers. 72-hour advance booking for events. Delivered throughout Austin.',
  keywords: 'buy alcohol online austin, premium spirits delivery, wine delivery austin, craft beer delivery, wedding alcohol service',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Premium Spirits & Wine Collection | Party On Delivery',
    description: 'Shop our curated collection of premium spirits, wine, champagne, and craft beer. Delivered throughout Austin.',
    url: 'https://partyondelivery.com/products',
    type: 'website',
    images: [
      {
        url: '/images/products/premium-spirits-wall.webp',
        width: 1200,
        height: 630,
        alt: 'Premium Spirits Collection - Party On Delivery',
      },
    ],
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OldFashionedNavigation />
      {children}
      <Footer />
    </>
  )
}