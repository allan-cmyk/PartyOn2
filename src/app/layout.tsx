import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import "./globals.css";
import AgeVerification from "@/components/AgeVerification";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { structuredData } from "./structured-data";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Lazy load GroupOrderProvider - only needed on specific pages
const GroupOrderProvider = dynamic(
  () => import('@/contexts/GroupOrderContext').then(mod => mod.GroupOrderProvider),
  { ssr: true }
);

const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://partyondelivery.com'),
  title: "Party On Delivery - Austin's Premier Alcohol Delivery Service",
  description: "Premium alcohol delivery for weddings, boat parties, and events in Austin. From Lake Travis to downtown, we bring the party to you. Licensed, insured, and ready in 30 minutes.",
  keywords: "alcohol delivery austin, wedding bar service, lake travis boat party, austin party delivery, premium spirits delivery",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Party On Delivery - Austin's Premier Alcohol Delivery Service",
    description: "Premium alcohol delivery for weddings, boat parties, and events in Austin. Licensed, insured, and ready in 30 minutes.",
    url: "https://partyondelivery.com",
    siteName: "Party On Delivery",
    images: [
      {
        url: "/images/hero/lake-travis-sunset.webp",
        width: 1200,
        height: 630,
        alt: "Party On Delivery - Austin Premium Alcohol Delivery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Party On Delivery - Austin's Premier Alcohol Delivery Service",
    description: "Premium alcohol delivery for weddings, boat parties, and events in Austin.",
    images: ["/images/hero/lake-travis-sunset.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Preload critical fonts - only essential weight for mobile */}
        <link
          rel="preload"
          href="/_next/static/media/cormorant-garamond-latin-300-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          media="(max-width: 768px)"
        />

        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.variable} ${cormorantGaramond.variable} antialiased bg-white text-navy-900`}>
        <CustomerProvider>
          <CartProvider>
            <GroupOrderProvider>
              <AgeVerification />
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
            </GroupOrderProvider>
          </CartProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
